import React, { useState, useEffect, useCallback } from 'react';
import { ref, get, update } from 'firebase/database';
import { useDatabase } from '../contexts';
import { getToday, getTodayReadable } from '../utils';

import Modal from 'react-modal';

import '../css/category.css';

function MenuReCommend() {
  const { database } = useDatabase();
  const dbRef = ref(database, 'menus');

  const [menus, setMenus] = useState([]);
  const [categoryMenus, setCategoryMenus] = useState([]);
  const [subcategoryMenus, setSubcategoryMenus] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [finalMenu, setFinalMenu] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMenu, setModalMenu] = useState(null);
  const [votedMenus, setVotedMenus] = useState({});

  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [selectedSubCategoryIndex, setSelectedSubCategoryIndex] = useState(null);

  const baseCategory = ['한식', '중식', '일식', '아시안식', '상관없음'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setMenus(data);
          setCategoryMenus(data);
        }
      } catch (error) {
        console.error('Error fetching menus:', error);
      }
    };

    fetchData();
  }, []);

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
    cleanup();
    return cleanup;
  }, []);

  const selectCategory = async (category, index) => {
    if (selectedCategory === category) {
      return;
    }
  
    setSelectedCategory(category);
    setSelectedCategoryIndex(index);
    setSubcategories([]); // 1차 카테고리가 변경되면 하위 카테고리 초기화
    setSelectedSubCategoryIndex(null);
    try {
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const temp = category === '상관없음' ? data : data.filter(menu => menu.nation === category);
        setCategoryMenus(temp);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };
  

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

  const openModal = useCallback((menu) => {
    setIsModalOpen(true);
    setModalMenu(menu);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalMenu(null);
  }, []);

  useEffect(() => {
    if (modalMenu && modalMenu.id) {
      const fetchModalMenuData = async () => {
        try {
          const menuRef = ref(database, `/menus/${modalMenu.id}`);
          const snapshot = await get(menuRef);
          if (snapshot.exists()) {
            const menuData = snapshot.val();
            setModalMenu(menuData);
          }
        } catch (error) {
          console.error('Error fetching menu data:', error);
        }
      };
      fetchModalMenuData();
    }
  }, [modalMenu]);

  const selectSubCategory = useCallback((index) => {
    setSelectedSubCategory(subcategories[index]);
    setSelectedSubCategoryIndex(index);

    if (!selectedCategory || !subcategories[index] || !categoryMenus.length) {
      return;
    }

    let temp = [];
    if (selectedCategory === '상관없음') {
      temp = categoryMenus.filter(menu => menu.type === subcategories[index]);
    } else {
      temp = categoryMenus.filter(
        menu => menu.type === subcategories[index] && menu.nation === selectedCategory
      );
    }
    setSubcategoryMenus(temp);

    if (temp.length > 0) {
      const randomIndex = Math.floor(Math.random() * temp.length);
      const randomMenu = temp[randomIndex];
      setFinalMenu(randomMenu);
      openModal(randomMenu);
    } else {
      setFinalMenu(null);
    }
  }, [selectedCategory, subcategories, categoryMenus, openModal]);

  useEffect(() => {
    selectSubCategory(selectedSubCategoryIndex);
  }, [categoryMenus, selectSubCategory, selectedSubCategoryIndex]);

  const upvote = async () => {
    if (!finalMenu) {
      alert('메뉴를 선택해 주세요.');
      return;
    }

    const targetMenuIndex = menus.findIndex(menu => menu.name === finalMenu.name);
    if (targetMenuIndex === -1) {
      return;
    }

    const today = getToday();
    const votedToday = finalMenu.lastVote === today;

    if (!votedMenus[finalMenu.id] && votedToday) {
      alert('이미 추천되었습니다.');
      return;
    }

    const updated = {
      ...finalMenu,
      lastVote: getToday(),
      vote: votedToday ? finalMenu.vote : (Number(finalMenu.vote) + 1),
    };

    const targetMenuRef = ref(database, `/menus/${targetMenuIndex}`);
    await update(targetMenuRef, { lastVote: updated.lastVote, vote: updated.vote });

    setVotedMenus(prevState => ({
      ...prevState,
      [finalMenu.name]: true,
    }));

    setFinalMenu(updated);
    setModalMenu(updated);

    setSubcategoryMenus(prevList =>
      prevList.map(item => (item.id === updated.id ? updated : item))
    );
  };

  const handleResetClick = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (finalMenu && finalMenu.id) {
      const fetchUpdatedMenuData = async () => {
        try {
          const menuRef = ref(database, `/menus/${finalMenu.id}`);
          const snapshot = await get(menuRef);
          if (snapshot.exists()) {
            const updatedMenuData = snapshot.val();
            setFinalMenu(updatedMenuData);
          }
        } catch (error) {
          console.error('Error fetching updated menu data:', error);
        }
      };

      fetchUpdatedMenuData();
    }
  }, [finalMenu, database]);

  return (
    <div className="recommend">
      <div className="section_title">메뉴 추천</div>
      <div className="dotted-line-container">
        <div className="dotted-line" />
        <img
          className="reset"
          src="https://i.ibb.co/yRggpzD/reset.png"
          onClick={handleResetClick}
        />
      </div>
      <div className="lists-container">
        <ul className="first_category">
          {baseCategory.map((category, index) => (
            <li
              key={index}
              className={selectedCategoryIndex === index ? 'selected' : ''}
              onClick={() => selectCategory(category, index)}
            >
              {category}
            </li>
          ))}
        </ul>
        <ul className="second_category">
          {subcategories.map((subcategory, index) => (
            <li
              key={index}
              className={selectedSubCategoryIndex === index ? 'selected' : ''}
              onClick={() => selectSubCategory(index)}
            >
              {subcategory}
            </li>
          ))}
        </ul>
        {finalMenu && (
          <Modal className="foodModal" isOpen={isModalOpen} onRequestClose={closeModal}>
            <div>
              <img
                className="reject"
                src="https://i.ibb.co/YZbWQM5/reject.png"
                alt="reject"
                onClick={closeModal}
              />
              <div className="card-frame">
                <div className="card-card">
                  <img className="card-image" src={finalMenu.url} alt="food" />
                  <p className="card_text">{finalMenu.name}</p>
                </div>
              </div>
            </div>
            {finalMenu && (
              <p className="menu-description">
                오늘({getTodayReadable()}) {finalMenu.vote}회의 추천을 받았습니다. &nbsp;
                {!votedMenus[finalMenu.name] && (
                  <img
                    className="vote"
                    src="https://i.ibb.co/4VXmN4x/like-1.png"
                    onClick={() => upvote()}
                  />
                )}
              </p>
            )}
          </Modal>
        )}
      </div>
    </div>
  );
}

export default MenuReCommend;
