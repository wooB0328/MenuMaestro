import React, { useState, useEffect} from "react";
import { ref, onValue } from "firebase/database";
import { useDatabase } from '../contexts';
import { useNavigate } from 'react-router-dom';

const WorldRank = () => {
  const { database } = useDatabase();
  const [rankings, setRankings] = useState([]);
  const [startCount, setStartCount] = useState(0);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const startCountsRef = ref(database, 'startCounts');
        onValue(startCountsRef, (snapshot) => {
          if (snapshot.exists()) {
            const startCountsData = snapshot.val();
            setStartCount(startCountsData.count); // Set the startCount value

            // 객체를 배열로 변환하고 내림차순 정렬
            const rankingsArray = Object.keys(startCountsData)
              .filter((name) => name !== 'count') // 'count' 필드 제외
              .map((name) => ({
                name,
                count: startCountsData[name],
              }))
              .sort((a, b) => b.count - a.count); // 숫자 기준으로 내림차순 정렬

            setRankings(rankingsArray);
          }
        });
      } catch (error) {
        console.error("랭킹을 가져오는 중 오류가 발생했습니다:", error);
      }
    };

    fetchRankings();
  }, [database]);

  const navigate = useNavigate();

  const handleBackClick = () => {
    // 뒤로 가기
    navigate(-1);
  };

  return (
    <div>
      <div className="section_title">월드컵 순위</div>
      <div className="dotted-line-container">
        <div className="dotted-line" />
      </div>
      <img className="go_back" src="https://i.ibb.co/cc1sC50/left-arrow.png" onClick={handleBackClick} />
      <div style={{height:'10vh'}}></div>
      <table className="rank_table">
        <thead>
          <tr>
            <th>순위</th>
            <th style={{minWidth:'10vw'}}>메뉴 이름</th>
            <th style={{lineHeight: '0.6', maxWidth:'8vw'}}>
                우승
                <br/>
                <span style={{fontSize:'1.8vh'}}>(최종 우승 / 전체 플레이)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((team, index) => (
            <tr key={team.name}>
              <td style={{fontWeight:'700'}}>{index + 1}</td>
              <td style={{fontSize: '4vh', fontWeight:'800'}}>{team.name}</td>
              <td>{team.count} / {startCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{height:'5vh'}}></div>
    </div>
  );
};

export default WorldRank;
