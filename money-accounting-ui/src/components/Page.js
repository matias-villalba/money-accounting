import {React, useState, Fragment} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import TransactionsTable from './TransactionsTable';
import Balance from './Balance';
import RefreshButton from './RefreshButton';

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(1),
    },
    title: {
      marginRight: theme.spacing(30),

      flexGrow: 1,
    },
  }));
  

export default function Page() {
  const classes = useStyles();

  const [lastRefresh, setLastRefresh]= useState(Date.now());

  const refresh = () =>{
    setLastRefresh(Date.now())
  };

  
  return (    
    <Fragment>
    <AppBar position="static">
    <Toolbar>

        <Balance  key={lastRefresh}/>
        <Typography variant="h5" align='center' className={classes.title}>
        Transactions List
        </Typography>
        <RefreshButton onRefresh={refresh}/>
    </Toolbar>
    </AppBar>

    <CssBaseline />
    <Container maxWidth="md">
      <TransactionsTable key={lastRefresh}/>
    </Container>
  </Fragment>

  );
}
