const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const customers = [
  {
    id: uuidv4(),
    cpf: '00692525300',
    name: 'Thiago Fake',
    statements: [],
  },
];

app.use(express.json());

app.post('/accounts', (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

  if (customerAlreadyExists) {
    return response.status(400).json({
      error: 'Customer already exists!',
    });
  }

  customers.push({
    id: uuidv4(),
    cpf,
    name,
    statements: [],
  });

  return response.status(201).send();
});

app.get('/statements', (request, response) => {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({
      error: 'Customer not found!',
    });
  }

  return response.send(customer.statements);
});

app.listen(3333);
