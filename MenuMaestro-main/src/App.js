import './App.css';

import Cookies from 'js-cookie';
// 상단 메뉴바 코드 
import { Navbar, Nav, Container, Modal } from 'react-bootstrap';

// 페이지 나누는 라우터 라이브러리와 모달
import {Routes, Route,  useNavigate  } from 'react-router-dom'

import { ref, get, getDatabase } from 'firebase/database';

// 각 페이지 컴포넌트
import RandomPick from './pages/RandomPick';
import FoodBoard from './pages/FoodBoard';
import MenuReCommend from './pages/MenuReCommend';
import WorldCup from './pages/WorldCup';
import MenuAdd from './pages/MenuAdd';
import MemberInfo from './pages/MemberInfo';

import { useState, useEffect } from 'react';
import { DatabaseProvider } from './contexts';
import WorldRank from './pages/WorldRank';

function App() {

  const [menus, setMenus] = useState([]);
  const db = getDatabase();
   // 상단 네비바->해당경로로 이동해주도록 변수에 저장
  let navigate = useNavigate()

   // 랜덤추천, 월드컵, 메뉴추천.js에서 사용할 상태변수 
  let [userPick, setUserPick] = useState(0);

 // 모달의 표시 여부 상태 변수
  let [showModal, setShowModal] = useState(true);

  //오늘 하루 보지 않음 상태 변수
  const [doNotShowToday, setDoNotShowToday] = useState(false);
  

  //데이터 베이스에서 데이터 배열로 가져오기
  useEffect(() => {
    const fetchData = async () => {
      const dbRef = ref(db, 'menus');
      try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const dataArray = Object.values(data);
          setMenus(dataArray);
        } else {
          setMenus([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [db]);

 
  const CloseModal= () =>{ //modal.head에서 close 누르면 실행되는 함수. 단순한 모달 닫기
    setShowModal(false);
  }

  //체크박스 클릭하면 실행되는 함수
  const handleClose = () => {
    setDoNotShowToday(true);
    setShowModal(false);
    
    // 모달이 닫힐 때마다 lastClosedTime 값을 업데이트
    const currentTime = new Date().getTime();
    Cookies.set('lastClosedTime', currentTime.toString(), { expires: 1 }); // 1일 동안 유효
  
    // 갱신된 쿠키를 바로 반영하기 위해 새로고침
    window.location.reload();
  };
  
  const closeclick = () => {
    handleClose();
    setDoNotShowToday(!doNotShowToday);
  };

  let menusCheck = () => {  //menus가 null값인지 확인하는 오류검사 코드
    if (menus.length === 0) {
      return -1;
    }
    else{
      return 1;
    }
  };

  let getRandomNumberArray = () => {  //랜덤 정수를 가지는 배열 리턴하는 함수. 오늘의 추천 메뉴에 쓰임.
    if (menus.length === 0) {
      return [];
    }
  
    const getRandomNumber = () => Math.floor(Math.random() * menus.length);
  
    const uniqueRandomNumbers = new Set();
  
    while (uniqueRandomNumbers.size < 3) {
      uniqueRandomNumbers.add(getRandomNumber());
    }
  
    return Array.from(uniqueRandomNumbers);
  };

  const ArraymenuIndex = getRandomNumberArray();  //랜덤 정수 3개를 가지는 배열

  //이 부분 있으면 하룻동안 모달창 안뜸.
  useEffect(() => {
    const lastClosedTimeString = Cookies.get('lastClosedTime');
    if (lastClosedTimeString) {
      const lastClosedTimeValue = parseInt(lastClosedTimeString, 10);
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - lastClosedTimeValue;
  
      const timeInterval = 60 * 60 * 24 * 1000; // 24시간

      if (timeDifference < timeInterval && !doNotShowToday) {
        setShowModal(false);
      } else {
        setShowModal(true);
      }
    }
  }, [doNotShowToday]);

  return (
    <DatabaseProvider>
      <div className="App">
        <Navbar className="nav-layout">
          <Container>
            <Navbar.Brand className = "menumaestro" title="사용 방법 화면으로 이동" onClick={()=> {navigate('/')}}>메뉴 마에스트로</Navbar.Brand>
            <Nav className="me-auto">
              <div className='nav-menu-image-container' title="메뉴 추천 화면으로 이동" > 
              <Nav.Link onClick={()=> {navigate('/MenuRecommend')}}>
              <img 
                className='nav-menu-image' 
                src="https://i.ibb.co/Tbvs0J9/like.png" alt="" />메뉴추천</Nav.Link>
              </div>
              <div className='nav-menu-image-container' title="랜덤 추천 화면으로 이동">
                <Nav.Link onClick={()=> {navigate('/RandomPick')}}>
                <img 
                className='nav-menu-image'
                src="https://i.ibb.co/h8C78Ps/random.png" alt="" />
                랜덤</Nav.Link>
              </div>
              <div className='nav-menu-image-container' title="월드컵 화면으로 이동">
                
                <Nav.Link onClick={()=> {navigate('/WorldCup')}}>
                <img
                
                className='nav-menu-image'
                src="https://i.ibb.co/pzz7WrL/worldcup.png" alt="" />
                월드컵</Nav.Link>
              </div>
              <div className='nav-menu-image-container' title="단원 게시판으로 이동">
                <Nav.Link onClick={()=> {navigate('/FoodBoard')}}>
                <img
                className='nav-menu-image'
                src="https://i.ibb.co/LnTZY3V/2x.png" alt="" />
                  단원 게시판 </Nav.Link>
              </div>
              <div className='nav-menu-image-container' title="메뉴 추가 화면으로 이동">
                <Nav.Link onClick={()=> {navigate('/MenuAdd')}}>
                <img
                className='nav-menu-image' 
                src="https://i.ibb.co/DwHZJxM/food-and-restaurant-4.png" alt="" />
                메뉴 추가</Nav.Link>
              </div>
            </Nav>
          </Container>
        </Navbar> 
        <img className='memberinfo'title="운영 단원 소개" alt='member'
          onClick={()=> {navigate('/MemberInfo')}}
          src="https://i.ibb.co/qWjYTwK/info-button-1.png"
        />
        <div>
        <Modal id = "randomModal" style={{minwidth: '100vw'}} show={showModal} onHide={CloseModal}>
          <Modal.Header style={{fontSize:'4vh', marginRight:'2vw', height:'10vh'}}closeButton>
          <Modal.Title style ={{fontSize:'5vh',left:'50%',transform:'translateX(-50%)',position:'fixed', whiteSpace:'nowrap'}}>오늘의 추천 메뉴!</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{top:'10vh',left:'50%',transform:'translateX(-50%)',position:'fixed', whiteSpace:'nowrap'}}>
            <table className='showToday'>
              <tbody>
              <tr>
              {[0, 1, 2].map((index) => (
          <td  key={index}>
            {menusCheck() !== -1 && (
              <img className='today_image' src={menus[ArraymenuIndex[index]].url} alt={`Menu ${index + 1}`} />
            )} 
          </td>
        ))}
              </tr>
              <tr>
              {[0, 1, 2].map((index) => (
          <td  key={index}>
            <center>
            {menusCheck() !== -1 && (
              <p style={{fontSize:'4vh', whiteSpace:'nowrap'}}>{menus[ArraymenuIndex[index]].name}</p>
            )}
            </center>
          </td>
        ))}
              </tr>
              </tbody>
            </table>
          </Modal.Body>
          <Modal.Footer style={{fontSize:'4vh', position:'fixed',bottom:0,left:0, border:'none'}}>
              <div onClick={closeclick}>
              <input type="checkbox" onChange ={closeclick} style={{cursor:'pointer',verticalAlign: "middle", width: "3vw", height: "3vw", marginRight: "1vw" }} />
                <label style={{cursor:'pointer'}}>오늘 하루 보지 않음</label>
                </div>
                         </Modal.Footer>
        </Modal>
        </div>
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/MenuRecommend' element={<MenuReCommend userPick={userPick} setUserPick={setUserPick}/>} />
          <Route path='/RandomPick' element={<RandomPick userPick={userPick} setUserPick={setUserPick}/>} />
          <Route path='/WorldCup' element={<WorldCup userPick={userPick} setUserPick={setUserPick}/>} />
          <Route path='/FoodBoard' element={<FoodBoard />} />
          <Route path='/MenuAdd' element={<MenuAdd />} />
          <Route path='/MemberInfo' element={<MemberInfo />} />
          <Route path='/WorldRank' element={<WorldRank />}/>

        </Routes>
    </div>
  </DatabaseProvider>
  );
}

function Main() {
  return(
    <div className="main-bg">
    <div className="container">
      <div className="logo_frame">
        <img className="logo" src="https://i.ibb.co/BLr11Tv/2.png" alt="Logo" />
      </div>
      <p className="text_info">하루에도 몇 번씩 “오늘 뭐 먹지?” 고민하는 사람들을 위한 메뉴 추천 서비스</p>
      <img className="info" src="https://i.ibb.co/qMRfdFp/1.png" alt="Info" />
    </div>
  </div>
  )
}

export default App;