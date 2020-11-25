import {React, useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';


const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});
  
export default function TransactionsTable() {
  const classes = useStyles();

  const [transactions, setTransactions] = useState([]);

  useEffect(()=>{
    const url = `http://localhost:3000/transactions`;
    fetch(url)
      .then(response => {
        return response.json();
      })
      .then(body => {
        setTransactions(body);
      });
  }, []);

  return (
      <TableContainer component={Paper} >
      <Table className={classes.table} aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell><b>Effective Date</b></TableCell>
            <TableCell align="center"><b>Type</b></TableCell>
            <TableCell align="right"><b>Amount</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.sort((t1, t2)=> new Date(t1.effectiveDate).getTime()-new Date(t2.effectiveDate).getTime())
                       .map((row) => (
            <TableRow key={row.id}>
              <TableCell component="th" scope="row">{row.effectiveDate}</TableCell>
              <TableCell align="center">{row.type}</TableCell>
              <TableCell align="right">${row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
