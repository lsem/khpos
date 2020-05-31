import React from "react";
import moment from "moment";
import "moment/locale/uk";
import { Button, ButtonGroup, Dialog } from "@material-ui/core";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { ArrowLeft, ArrowRight } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import MomentUtils from "@date-io/moment";

const useStyles = makeStyles((theme) => ({
  root: {
    cursor: "pointer",
  },
}));

export default function KhDatePicker({ value, onChange, style }) {
  const classes = useStyles();

  const [showDialog, setShowDialog] = React.useState(false);

  const decreseDay = () => {
    onChange(moment(value).subtract(1, "days").valueOf());
  };

  const increseDay = () => {
    onChange(moment(value).add(1, "days").valueOf());
  };

  return (
    <div className={classes.root} style={style}>
      <ButtonGroup
        size="large"
        color="primary"
        aria-label="contained primary button group"
      >
        <Button onClick={decreseDay} style={{ padding: 0 }}>
          <ArrowLeft />
        </Button>
        <Button
          onClick={() => {
            setShowDialog(true);
          }}
        >
          {moment(value).calendar().split(" о")[0]}
        </Button>
        <Button onClick={increseDay} style={{ padding: 0 }}>
          <ArrowRight />
        </Button>
      </ButtonGroup>

      <Dialog
        open={showDialog}
        onClose={() => {
          setShowDialog(false);
        }}
      >
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <DatePicker
            autoOk
            variant="static"
            openTo="date"
            value={value}
            onChange={(v) => {
              onChange(v);
              setShowDialog(false);
            }}
          />
        </MuiPickersUtilsProvider>
      </Dialog>
    </div>
  );
}
