import React, { useState, useEffect, useCallback } from 'react';
import { ref, get, update } from 'firebase/database';
import { useDatabase } from '../contexts';
import { getToday, getTodayReadable } from '../utils';

import Modal from 'react-modal';

import '../css/category.css'

function MenuReCommend() {
  const { database } = useDatabase();   // 데이터베이스 가져오기
  const dbRef = ref(database, 'menus'); // 'menus' 참조 생성

  // 상태 변수 목록
  const [menus, setMenus] = useState([]);                               // 선택 연산에 사용할 메뉴 목록
  
  const [selectedCategory, setSelectedCategory] = useState(null);       // 선택한 1차 카테고리를 저장
  const [subcategories, setSubcategories] = useState([]);               // 하위 카테고리 종류 설정
  const [selectedSubCategory, setSelectedSubCategory] = useState(null); // 선택된 하위 카테고리 저장
  const [filteredMenus, setFilteredMenus] = useState([]);               // 필터링된 메뉴 저장
  const [finalMenu, setFinalMenu] = useState(null);                     // 최종 추천 메뉴 무작위 선정
  
  const [isModalOpen, setIsModalOpen] = useState(false);               // 최종 추천 메뉴 모달 창 보임 상태
  const [modalMenu, setModalMenu] = useState(null);                    // 모달 메뉴 상태 저장
  const [votedMenus, setVotedMenus] = useState({});                    // 메뉴 추천 상태 저장

  const baseCategory = [ "한식", "중식", "일식", "아시안식", "상관없음"]; // 1차 카테고리

  
  useEffect(() => {
    // 파이어베이스에서 데이터 가져오기
    const fetchData = async () => {
      try {
        const snapshot = await get(dbRef); // 'menus' 참조의 데이터 가져오기
        if (snapshot.exists()) {
          const data = snapshot.val(); 
          setMenus(data);
        }
      } catch (error) {
        console.error('Error fetching menus:', error);
      }
    };

    fetchData();
  }, []); // 첫 마운트에만 실행

    
  // 초기화 cleanup 함수
  const cleanup = () => {
    setSelectedCategory(null);
    setSubcategories([]);
    setSelectedSubCategory(null);

    setFinalMenu(null);
    setIsModalOpen(false);
    setModalMenu(null);
    setVotedMenus({});
  };

  useEffect(() => {
    cleanup(); // 컴포넌트가 처음 마운트될 때 바로 초기화
    return cleanup; // unmount 시에도 실행되도록 함
  }, []); 


  // 1차 카테고리 온클릭 메소드
  const selectCategory = async (category) => {
    setSelectedCategory(category); // baseCategory 선택

    try {
      const snapshot = await get(dbRef); 
      if (snapshot.exists()) {
        const data = snapshot.val();
        const temp = category === '상관없음' ? data : data.filter(menu => menu.nation === category);
        setFilteredMenus(temp); // 필터링된 메뉴들을 filteredMenus 상태로 업데이트
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  // 2차 카테고리 세팅
  useEffect(() => {
    const setSubCategoriesByCategory = (selectedCategory) => {
      switch (selectedCategory) {
        case '한식':
          setSubcategories(['밥류', '면류', '찌개류', '육류', '기타']);
          break;
          case '중식':
            setSubcategories(['밥류', '면류', '탕류', '육류', '해산물류']);
            break;
        case '양식':
            setSubcategories(['밥류', '면류', '빵류', '육류', '해산물류']);
            break;
        case '일식':
            setSubcategories(['밥류', '면류', '해산물류', '육류', '기타']);
            break;
        case '아시안식':
            setSubcategories(['밥류', '면류', '국물류', '육류', '기타']);
            break;
        case '상관없음':
            setSubcategories(['밥류', '면류', '빵류', '찌개류', '탕류', '국물류', '육류', '해산물류', '기타']);
            break;
        default:
          setSubcategories([]);
          break;
      }
    };
  
    if (selectedCategory !== null) {
      setSubCategoriesByCategory(selectedCategory);
    }
  }, [selectedCategory]);
  

  // 모달 창 열고 닫기
  const openModal = useCallback((menu) => {
    setIsModalOpen(true);
    setModalMenu(menu);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalMenu(null);
  }, [])

  // 모달 창에 뜨는 메뉴의 정보 최신 업데이트
  useEffect(() => {
    if (modalMenu && modalMenu.id) {
      const fetchModalMenuData = async () => {
        try {
          const menuRef = ref(database, `/menus/${modalMenu.id}`);
          const snapshot = await get(menuRef);
          if(snapshot.exists()) {
            const menuData = snapshot.val();
            setModalMenu(menuData);
          }
        } catch(error) {
          console.error('Error fetching menu data:', error);
        }
      };
      fetchModalMenuData();
    }
  }, [modalMenu]);

  // 2차 카테고리 선택에 따른 메뉴 필터링
  const selectSubCategory = useCallback((index) => {
    setSelectedSubCategory(subcategories[index]);

    // 값이 비어 있는 경우에는 더 이상 진행하지 않음
    if (!selectedCategory || !subcategories[index] || !filteredMenus.length) {
      return;
    }
      let temp = [];
      if (selectedCategory === '상관없음') {
        temp = filteredMenus.filter(menu => menu.type === subcategories[index]);
      }
      else {
        temp = filteredMenus.filter(
          menu => menu.type === subcategories[index] && menu.nation === selectedCategory);
      }
      setFilteredMenus(temp);

      // filteredMenus에서 랜덤으로 메뉴 하나 선택
      if (filteredMenus.length > 0) {
        const randomIndex = Math.floor(Math.random() * temp.length);
        const randomMenu = temp[randomIndex];
        setFinalMenu(randomMenu);
        openModal(randomMenu);
      } else {
        setFinalMenu(null);
      }
  }, [selectedCategory, subcategories, filteredMenus, openModal]);


  useEffect(() => {
    selectSubCategory(selectedSubCategory);
  }, [filteredMenus, selectSubCategory, selectedSubCategory]);


  // 최종 선정 메뉴에 대한 추천 남기기(한 메뉴에 가능한 최대 투표 수: 1일 1회)
  const upvote = async () => {
    if (!finalMenu) {
      alert('메뉴를 선택해 주세요.');
      return;
    }

    // 전체 메뉴에서 최종 메뉴 찾기
    const targetMenuIndex = menus.findIndex(menu => menu.name === finalMenu.name)
    if(targetMenuIndex == -1) {
      return;
    }
    
    const today = getToday();
    const votedToday = finalMenu.lastVote === today;

    // 하루에 한 번 추천 가능
    if (!votedMenus[finalMenu.id] && votedToday) {
      alert('이미 추천되었습니다.');
      return;
    }

    const updated = {
      ...finalMenu,
      lastVote: getToday(),
      vote: votedToday ? finalMenu.vote : (Number(finalMenu.vote) + 1) 
    };
        
    const targetMenuRef = ref(database, `/menus/${targetMenuIndex}`);
    await update(targetMenuRef, { lastVote: updated.lastVote, vote: updated.vote });
      
    setVotedMenus(prevState => ({
      ...prevState,
      [finalMenu.name]: true,
    }));

    setFinalMenu(updated);
    setModalMenu(updated);

    setFilteredMenus(prevList => 
      prevList.map(item => (item.id === updated.id ? updated : item)));
  };

  useEffect(() => {
    // finalMenu가 변경될 때마다 실행
    if (finalMenu && finalMenu.id) {
      const fetchUpdatedMenuData = async () => {
        try {
          const menuRef = ref(database, `/menus/${finalMenu.id}`);
          const snapshot = await get(menuRef);
          if (snapshot.exists()) {
            const updatedMenuData = snapshot.val();
            // finalMenu 상태를 최신 데이터로 업데이트
            setFinalMenu(updatedMenuData);
          }
        } catch (error) {
          console.error('Error fetching updated menu data:', error);
        }
      };
  
      fetchUpdatedMenuData();
    }
  }, [finalMenu, database]);

  // 리턴 렌더링 부분
  return (
    <div className="recommend">
      <center><h2>메뉴 추천</h2></center>
        <ul >
            {baseCategory.map((category, index) => (
              <li key={index} onClick={()=> selectCategory(category)}>
                {category}</li>
            ))}
          </ul>
          <p></p>
          <ul>
          {subcategories.map((subcategory, index) => (
          <li key={index} onClick={() => selectSubCategory(index)}>
            {subcategory}</li> ))}
          </ul>
          {finalMenu && (
              <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
                <div style={{width: '300px', backgroundColor: 'white'}}>
                  <div className="card-frame">
                    <div className="card-card">
                      <img className="card-image" src={finalMenu.url} alt="food" />
                      <p className="card_text">{finalMenu.name}</p>
                      <span style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}} onClick={closeModal}>
                        {' '}닫기{' '}
                      </span>
                    </div>
                  </div>
                </div>
                {finalMenu && (<p className="menu-description">
                    오늘({getTodayReadable()}) {finalMenu.vote}회의 추천을 받았습니다. &nbsp;
                    {!votedMenus[finalMenu.id] && (
                      <img className="vote" src="https://i.ibb.co/4VXmN4x/like-1.png" 
                    width={'40px'} onClick={() => upvote()} />
                    )}
                    
                  </p>)}
                  
              </Modal>
          )}
    </div>
  );  
} 

export default MenuReCommend;
