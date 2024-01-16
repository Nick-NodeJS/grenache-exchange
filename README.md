# grenache-exchange

## Setup

Run two Grapes:

```
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

```
# Add base as upstream:
git remote add upstream https://github.com/bitfinexcom/bfx-util-js

# Configure service:
bash setup-config.sh
```


### Run exchange

```
PORT=1335 SEED_ORDERS=true npm run start
```
where:

PORT -  RPC Server port

SEED_ORDERS - if you need to seed randomly orders