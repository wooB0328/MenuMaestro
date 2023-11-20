
import { useState, useRef, useEffect } from 'react';
import '../index.css'
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import { getDatabase, ref, set, update } from "firebase/database";
import { useDatabase } from '../contexts';
import { onValue } from "firebase/database";
import {isEqual, getToday, getTodayReadable} from '../utils';
Modal.setAppElement('#root');

function RandomRick({ userPick, setUserPick }) {
  const {database} = useDatabase();
  const newMenuRef = ref(database, 'menus');
  const [menus, setMenus] = useState([]);
  const [currentMenu, setCurrentMenu] = useState({});
  const lastMenuNameRef = useRef('');
  const [modalIsOpen, setModalIsOpen] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);

  const upvote = () => {
    if (!hasVoted) {
    const targetMenuIndex= menus.findIndex(menu => menu.name === currentMenu.name)
    const updated = {...currentMenu, lastVote: getToday(), vote: currentMenu.lastVote === getToday() ? currentMenu.vote+1 : 0}
    setCurrentMenu(updated);
    const newMenus = [...menus];
    newMenus.splice(targetMenuIndex, 1, updated)
    set(ref(database, '/menus'), newMenus);
    setHasVoted(true);
    }
    }

const pickCurrentMenu = ({data, force}) => {
    if (!force && lastMenuNameRef.current !== '') {
      const targetMenu= data.find(menu => menu.name === currentMenu.name)
      if (targetMenu) {
        if (getToday() !== targetMenu.lastVote){
          setCurrentMenu(menu => ({...menu, lastVote: getToday(), vote: 0}));
        } else {
          setCurrentMenu(menu => ({...menu, vote: targetMenu.vote }));
        }
      }
      return;
    }
    const randomKey = Math.floor(Math.random() * data.length);
    const selectedObject = data[randomKey];
    
    if (lastMenuNameRef.current === selectedObject.name) {
      pickCurrentMenu({data, force});
      return;
    }
    
    lastMenuNameRef.current = selectedObject.name;
    
    setCurrentMenu({...selectedObject, lastVote: getToday(), vote: selectedObject.lastVote === getToday() ? selectedObject.vote : 0});
  } 

  onValue(newMenuRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      alert('메뉴가 없습니다. 메뉴를 추가해주세요.');
      return;
    }
    
    if (isEqual(data, menus)) return;
    setMenus(data);
    pickCurrentMenu({data, force: false});
  });

  const closeModal = () => {
    setModalIsOpen(false);
  }

  useEffect(() => {
    setModalIsOpen(false);
  }, []);


  return (
    <>
    <Modal
    isOpen = {modalIsOpen}
    contentLabel='모달'
    className= 'Modal'>
        <div className = "modal_title">랜덤</div>
        <button className = "rectangle" onClick={closeModal}>시작</button>
        <Link to = "/">
        <img className='reject' src = "https://i.ibb.co/YZbWQM5/reject.png"></img>
        </Link>
    </Modal>
      <h1 className='section_title'>랜덤</h1>
      <div className="dotted-line-container">
        <div className="dotted-line" />
        <img className = 'reset' src="https://i.ibb.co/yRggpzD/reset.png" onClick={() =>{
          pickCurrentMenu({ data: menus, force: true })
          setHasVoted(false); }} alt="reset" />
      </div>
      <div className='card_frame'>
        <div className="card_card">
          <img className="card_image" src={currentMenu.url} alt={currentMenu.name} />
          <p className="card_text">{currentMenu.name}</p>
        </div>
      </div>
      <p className="random-menu-description">
        오늘({getTodayReadable()}) {currentMenu.vote}회의 추천을 받았습니다 &nbsp;
        <img className= 'vote' src = "https://i.ibb.co/4VXmN4x/like-1.png" width={"40px"} onClick={upvote}/>
      </p>
    </>
  );
} 
export default RandomRick;
