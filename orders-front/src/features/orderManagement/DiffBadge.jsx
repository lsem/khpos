import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Badge from "@material-ui/core/Badge";
import { TrendingDown, TrendingUp, Done } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "inline-block",
    "& > *": {
      margin: `0 ${theme.spacing(1)}px`,
    },
  },
}));

export default function DiffBadge({ kind, diff, onClick }) {
  const classes = useStyles();

  const numToStr = (num) => {
    if (num <= 0) return num;
    return `+${num}`;
  };

  return (
    <div
      className={classes.root}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick();
      }}
    >
      {kind === "Change" ? (
        diff < 0 ? (
          <Badge
            badgeContent={numToStr(diff)}
            color="secondary"
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <TrendingDown color="secondary" />
          </Badge>
        ) : (
          <Badge
            badgeContent={numToStr(diff)}
            color="secondary"
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <TrendingUp color="secondary" />
          </Badge>
        )
      ) : (
        <Badge
          badgeContent={numToStr(diff)}
          color="primary"
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <Done color="primary" />
        </Badge>
      )}
    </div>
  );
}
