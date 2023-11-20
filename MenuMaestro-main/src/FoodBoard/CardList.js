import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import FoodCard from "./Card";

const createArray = (length) => [...Array(length)];

// CustomArrow 컴포넌트 정의
const CustomArrow = ({ onClick, text }) => (
  <button type="button" onClick={onClick}>
    {text}
  </button>
);

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  draggable: false,
  pauseOnHover: true,
  infinite: false,
  arrows: true,
  //prevArrow: <CustomArrow text="이전" />, 이전 버튼
  //nextArrow: <CustomArrow text="다음" />, 다음 버튼
};

const CardList = ({ data = []}) => {
  
  return (
    <div className="cardlist">
      <center>
        <div className="date_text">{data[0].date}</div>
      </center>
      <Slider {...settings}>
        
        {data.map((n, i) => (
          <FoodCard title={n.title} src={n.src} detail={n.detail} date={n.date} key={i} />
        ))}
        <div></div>
      </Slider>
    </div>
  );
};

export default CardList;
