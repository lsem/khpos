//https://medium.com/@david.gilbertson/icons-as-react-components-de3e33cb8792

import React from 'react'

const Icon = props => {
  const { icon, size, color } = props;

  const styles = {
    svg: {
      display: 'inline-block',
      verticalAlign: 'middle'
    },
    path: {
      fill: color,
    },
  };

  return (
    <svg
      style={styles.svg}
      width={`${size}px`}
      height={`${size}px`}
      viewBox={`0 0 ${size} ${size}`}
    >
      <path
        style={styles.path}
        d={icon}
      ></path>
    </svg>
  );
};

export default Icon
