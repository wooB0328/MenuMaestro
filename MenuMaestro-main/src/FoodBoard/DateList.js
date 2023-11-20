import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CardList from "./CardList";

const DateList = ({ data = [] }) => {
  let groupedObjects = data.reduce((acc, obj) => {
    const key = obj.date;
    if (!acc[key]) {
      acc[key] = [obj];
    } else {
      acc[key].push(obj);
    }
    return acc;
  }, {});

  const result = Object.values(groupedObjects);

  return (
    <>
      {result.map((group, index) => (
        <CardList key={index} data={group} />
      ))}
    </>
  );
};

export default DateList;
