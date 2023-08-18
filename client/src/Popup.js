import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import HelpOutlineTwoToneIcon from "@mui/icons-material/HelpOutlineTwoTone";

const useStyles = makeStyles((theme) => ({
  // dialog: {
  //   padding: 10,
  //   position: "absolute",
  //   top: theme.spacing(5),
  // },
  // dialogTitle: {
  //   textAlign: "center",
  // },
  // dialogContent: {
  //   textAlign: "center",
  // },
  // dialogAction: {
  //   justifyContent: "center",
  // },
  // titleIcon: {
  //   backgroundColor: theme.palette.primary.light,
  //   color: theme.palette.primary.main,
  //   "&:hover": {
  //     backgroundColor: theme.palette.primary.light,
  //     cursor: "default",
  //   },
  //   "& .MuiSvgIcon-root": {
  //     fontSize: "7rem",
  //   },
  // },
}));

export default function Popup(props) {
  const { children, openPopup, setOpenPopup } = props;
  const classes = useStyles();

  return (
    <Dialog
      open={openPopup}
      maxWidth="md"
      classes={{ paper: classes.dialogWrapper }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {/* <IconButton disableRipple className={classes.titleIcon}>
          <DoneAllIcon />
        </IconButton> */}
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
