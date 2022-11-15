const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const accounts = [
  {
    id: uuidv4(),
    cpf: '00692525300',
    name: 'Thiago Fake',
    statements: [],
  },
];

app.use(express.json());

// Middleware
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const account = accounts.find((account) => account.cpf === cpf);
  request.account = account;

  if (!account) {
    return response.status(400).json({
      error: 'Account not found!',
    });
  }

  return next();
}

function getBalance(statements) {
  const balance = statements.reduce(
    (balance, operation) => balance + (operation.type === 'credit' ? operation.amount : -operation.amount),
    0
  );

  return balance;
}

app.post('/accounts', (request, response) => {
  const { cpf, name } = request.body;

  const accountAlreadyExists = accounts.some((account) => account.cpf === cpf);

  if (accountAlreadyExists) {
    return response.status(400).json({
      error: 'Account already exists!',
    });
  }

  accounts.push({
    id: uuidv4(),
    cpf,
    name,
    statements: [],
  });

  return response.status(201).send();
});

app.get('/statements', verifyIfExistsAccountCPF, (request, response) => {
  const { account } = request;
  return response.send(account.statements);
});

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { account } = request;

  const statementOperation = {
    type: 'credit',
    description,
    amount,
    createdAt: new Date(),
  };

  account.statements.push(statementOperation);

  return response.status(201).send();
});

app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { account } = request;

  const balance = getBalance(account.statements);

  if (balance < amount) {
    return response.status(400).json({
      error: 'Insufficient funds!',
    });
  }

  const statementOperation = {
    type: 'debit',
    description,
    amount,
    createdAt: new Date(),
  };

  account.statements.push(statementOperation);

  return response.status(201).send();
});

app.listen(3333);
