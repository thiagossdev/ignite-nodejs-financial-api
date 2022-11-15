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

app.listen(3333);
