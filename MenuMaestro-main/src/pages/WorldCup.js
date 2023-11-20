import React, { useState, useEffect, useRef } from "react";
import { ref, onValue, get, set, update } from "firebase/database";
import { useDatabase } from '../contexts';
import '../css/worldcup.css';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import {isEqual, getToday, getTodayReadable} from '../utils';



const WorldCup = () => {
  const { database } = useDatabase();
  const [round, setRound] = useState(16);
  const [teams, setTeams] = useState([]);
  const [displays, setDisplays] = useState([]);
  const [winners, setWinners] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(true);
  const [winningTeamData, setWinningTeamData] = useState(null);
  const [isVoteClicked, setIsVoteClicked] = useState(false);

  
  const increaseStartCount = async () => {
    try {
      const startCountsRef = ref(database, 'startCounts');
      const currentCountSnapshot = await get(startCountsRef);
  
      if (currentCountSnapshot.exists()) {
        const currentCount = currentCountSnapshot.val();
  
        // 객체 내에 'count' 필드가 있으면 증가시킴
        if (typeof currentCount === 'object' && 'count' in currentCount) {
          await update(startCountsRef, { ...currentCount, count: currentCount.count + 1 });
        } else {
          // 'count' 필드가 없으면 1로 초기화
          await set(startCountsRef, { count: 1 });
        }
        console.log("Firebase에 정상적으로 startCounts가 업데이트 되었습니다.");
      } else {
        // 'startCounts' 필드가 없으면 1로 초기화
        await set(startCountsRef, { count: 1 });
        console.log("Firebase에 정상적으로 startCounts가 생성 및 초기화 되었습니다.");
      }
    } catch (error) {
      console.error("전체 플레이 횟수 갱신 중:", error);
    }
  };
  

  const finalWinner = async (team) => {
    try {
      const menusRef = ref(database, 'menus');
      const menusSnapshot = await get(menusRef);
  
      if (menusSnapshot.exists()) {
        const menusData = menusSnapshot.val();
        const teamIndex = Object.values(menusData).findIndex((menu) => menu.name === team.name);
  
        if (teamIndex !== -1) {
          const teamRef = ref(database, `menus/${teamIndex}`);
          const teamSnapshot = await get(teamRef);
  
          if (teamSnapshot.exists()) {
            const { name, lastVote, vote, url } = teamSnapshot.val();

            try {
              const rankRef = ref(database, 'startCounts');
              const rankSnapshot = await get(rankRef);
            
              if (rankSnapshot.exists()) {
                const currentCounts = rankSnapshot.val();
                const updatedCounts = { ...currentCounts, [team.name]: currentCounts[team.name] + 1 };
                await update(rankRef, updatedCounts);
                console.log(`${team.name}의 rankCounts 업데이트 : ${updatedCounts[team.name]}`);
              } else {
                console.error("startCounts를 찾을 수 없습니다.");
              }
            } catch (error) {
              console.error("최종 우승자 투표 수 갱신 중 오류 발생:", error);
            }
            
            if(getToday() !== lastVote)
            {
              setWinningTeamData({ name, lastVote, vote:0, url }); // 상태 업데이트
              console.log(`${name}의 lastVote: ${lastVote}, vote: 0, url: ${url}`);

            }else{
              setWinningTeamData({ name, lastVote, vote, url }); // 상태 업데이트
              console.log(`${name}의 lastVote: ${lastVote}, vote: ${vote}, url: ${url}`);

            }
            
          } else {
            console.error(`${team.name} 팀을 찾을 수 없습니다.`);
          }
        } else {
          console.error(`${team.name} 팀을 menus 배열에서 찾을 수 없습니다.`);
        }
      } else {
        console.error("메뉴 데이터를 가져올 수 없습니다.");
      }
  
      console.log("Firebase에 정상적으로 finalWinner가 업데이트 되었습니다.");
    } catch (error) {
      console.error("최종 우승자 선택 중:", error);
    }
  };
  
  
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const menusRef = ref(database, 'menus');
        onValue(menusRef, (snapshot) => {
          if (snapshot.exists()) {
            const menusData = snapshot.val();
            const shuffledItems = Object.values(menusData).sort(() => Math.random() - 0.5);
  
            setTeams(shuffledItems.slice(0, 16));
            setDisplays([shuffledItems[0], shuffledItems[1]]);
          }
        });
      } catch (error) {
        console.error("메뉴를 가져오는 중 오류가 발생했습니다:", error);
      }
    };
  
    fetchMenus();
  }, [database]);

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const clickWinnerRef = useRef();
  const clickWinner = (team) => () => {
    if (round <= 1) {
      return;
    }
    if (round === 2) {
      finalWinner(team);
      increaseStartCount();
      console.log('최종 우승:', team.name);
      setRound(1);
      clickWinnerRef.current = () => {}; // 더 이상의 클릭 비활성화
    }
    if (teams.length <= 2) {
      if (winners.length === 0) {
        setDisplays([team]);
      } else {
        const updatedTeams = [...winners, team];
        setTeams(updatedTeams);
        setDisplays([updatedTeams[0], updatedTeams[1]]);
        setWinners([]);
        setRound((prevRound) => prevRound / 2);
      }
    } else if (teams.length > 2) {
      setWinners([...winners, team]);
      setDisplays([teams[2], teams[3]]);
      setTeams(teams.slice(2));
    }
  };
  
  const handleResetClick = () => {
    // 페이지를 새로고침
    window.location.reload();
  };

  const upVote = async () => {
    try {
      if (winningTeamData && !isVoteClicked) {
        let updatedVote = 0;
        const menuRef = ref(database, 'menus');
        const snapshot = await get(menuRef);
  
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const menuData = childSnapshot.val();
            if (menuData.name === winningTeamData.name) {
              const menuKey = childSnapshot.key;
              const menuItemRef = ref(database, `menus/${menuKey}`);
              if (getToday() === winningTeamData.lastVote) {
                updatedVote = winningTeamData.vote + 1;
              } else {
                updatedVote = 1;
              }
              console.log(getToday());
              update(menuItemRef, { vote: updatedVote, lastVote: getToday() }).then(() => {
                // Update the local state
                setWinningTeamData((prevData) => ({
                  ...prevData,
                  vote: updatedVote,
                  lastVote: getToday(),
                }));
                console.log(`${menuData.name}의 vote: ${updatedVote}, lastVote:${getToday()} `);
              }).catch((error) => {
                console.error("Firebase 투표 업데이트 중 오류 발생:", error);
              });
            }
          });
        } else {
          console.error(`팀 ${winningTeamData.name}을 찾을 수 없습니다.`);
        }
      }
    } catch (error) {
      console.error("투표 업데이트 중 오류 발생:", error);
    }
    setIsVoteClicked(true);
    setModalIsOpen(false);
  };
  
  useEffect(() => {
    if (round === 1) {
      setModalIsOpen(true);
    }
  }, [round]);

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        contentLabel='모달'
        className='Modal'
      >
         <div className="modal_title">월드컵</div>
         <button className = "rectangle" onClick={() => {closeModal();}}>시작</button>
        <Link to="/">
          <img className='reject' src="https://i.ibb.co/YZbWQM5/reject.png" alt="reject"></img>
        </Link>
       
      </Modal>
      <h1 className="section_title">월드컵</h1>
      <div className="dotted-line-container">
        <div className="dotted-line" />
        <img className = 'reset' src="https://i.ibb.co/yRggpzD/reset.png" onClick={handleResetClick}/>
      </div>
      <Link to ="/WorldRank">
        <button className="ranking" >전체 순위</button>
      </Link>
      {round === 16 && <div className="worldcup_round"><p>16강</p></div>}
      {round === 8 && <div className="worldcup_round"><p>8강</p></div>}
      {round === 4 && <div className="worldcup_round"><p>4강</p></div>}
      {round === 2 && <div className="worldcup_round"><p>결승</p></div>}
      <div className="worldcup_frame">
        {round !== 1 && displays.map((team) => (
          <div className="card_card" key={team.name} onClick={clickWinner(team)}>
            <img className="card_image" src={team.url} alt={team.name} />
            <p className="card_text">{team.name}</p>
          </div>
        ))}
      {round !== 1 && <p className="vs">VS.</p>}
      </div>
      {round === 1 && (
        <>
      <p className="worldcup_finalround">우승</p>
          <Modal
            isOpen={modalIsOpen}
            contentLabel='Final Modal'
            className='Modal'
            style={{
              overlay: {
                position: 'fixed',
                top: '15vh',
                left: '28vw',
                right: '28vw',
                bottom: '15vh',
                backgroundColor: '#2CCEC9'
              }
            }}
          >
            <div className="modal_title">월드컵 결과</div>
            <button className="rectangle" onClick={closeModal} >확인</button>
            <Link to="/">
              <img className='reject' src="https://i.ibb.co/YZbWQM5/reject.png" alt="reject"></img>
            </Link>
          </Modal>
  {winningTeamData && (
    <div className="worldcup_frame">
    <div className="card_card" key={winningTeamData.name}>
      <img className="card_image" src={winningTeamData.url} alt={winningTeamData.name} />
      <p className="card_text">{winningTeamData.name}</p>
    </div>
    </div>
  )}
<p className="random-menu-description">
  오늘({getTodayReadable()}) {winningTeamData ? winningTeamData.vote : null}회의 추천을 받았습니다 &nbsp;
  <img className={`vote ${isVoteClicked ? 'disabled' : ''}`}src="https://i.ibb.co/4VXmN4x/like-1.png" 
  onClick={upVote} />
</p>


        </>
      )}
    </>
  );
};

export default WorldCup;