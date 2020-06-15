import React from 'react';
import { useLocation } from "react-router-dom";

function ItemLog() {
  const location = useLocation();
  const item = location.state;

  return (
    <div>
      {JSON.stringify(item.history)}
    </div>
  )
}

export default ItemLog
