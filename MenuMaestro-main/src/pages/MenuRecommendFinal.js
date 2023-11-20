import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import '../css/category.css';
import { getTodayReadable } from '../utils';

function MenuRecommendFinal({ currentMenu, upvote, onClose }) {
  const [showCard, setShowCard] = useState(true);

  const close = () => {
    setShowCard(false);
    onClose();
  };

  return (
    <>
      <div className='recommend_card'>
        <Card>
          <Card.Body>
            <Card.Title><img src={currentMenu.url} alt="food" /></Card.Title>
            <Card.Text>{currentMenu.name}</Card.Text>
            <span style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }} onClick={close}> 닫기 </span>
          </Card.Body>
        </Card>
        <p className="random-menu-description">
          오늘({getTodayReadable()}) {currentMenu.vote}회의 추천을 받았습니다 &nbsp;
          <img src="https://i.ibb.co/4VXmN4x/like-1.png" width={"40px"} onClick={upvote} />
        </p>
      </div>
    </>
  );
}

export default MenuRecommendFinal;
