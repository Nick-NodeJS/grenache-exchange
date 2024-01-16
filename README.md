# grenache-exchange

## Setup

Run two Grapes:

```
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```


### Run exchange

```
PORT=1335 SEED_ORDERS=true npm run start
```
where:

PORT -  RPC Server port

SEED_ORDERS - if you need to seed randomly orders