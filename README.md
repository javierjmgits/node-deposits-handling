# node-deposits-handling

Sample node console application that reads two files:

* trx.json (containing transactions from bitcoind) and
* known_customers.json (customers we are interested in)

and then 

* introduces the transactions into mongodb and
* read the ones confirmed to finally
* prints information about them
