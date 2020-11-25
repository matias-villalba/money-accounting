import {React, useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(20),
    },
    title: {
      flexGrow: 1,
    },
  }));
  

export default function Balance() {
  const classes = useStyles();


  const [account, setAccount] = useState({balance:0});

  useEffect(()=>{
    const url = `http://localhost:3000/accounts/1`;
    fetch(url)
      .then(response => {
        return response.json();
      })
      .then(body => {
        setAccount(body);
      });
  }, []);

  return (
        <Typography variant="h6" className={classes.menuButton}>
        Account balance: ${account.balance.toFixed(2)}
        </Typography>
  );
}
