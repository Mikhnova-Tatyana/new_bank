class Client {
  constructor(clientData) {
    this.fullName = clientData.fullName;
    this.identificationNumber = clientData.identificationNumber;
    this.isActiveClient = clientData.isActiveClient;
    this.creditAccounts = [];
    this.debitAccounts = [];
    this.registrationDate = new Date().toLocaleDateString();
  }
}

class CreditAccount {
  constructor(creditData) {
    this.balance = creditData.balance;
    this.limit = creditData.limit;
    this.isActive = creditData.isActive;
    this.currencyType = creditData.currencyType;
    this.activationDate = new Date().toLocaleDateString();
    this.cardExpirationDate = new Date(new Date().
      setFullYear(new Date().getFullYear() + 5)).toLocaleDateString();
  }
}

class DebetAccount {
  constructor(debetData) {
    this.balance = debetData.balance || 0;
    this.isActive = debetData.isActive;
    this.currencyType = debetData.currencyType;
    this.activationDate = new Date().toLocaleDateString();
    this.cardExpirationDate = new Date(new Date().
      setFullYear(new Date().getFullYear() + 5)).toLocaleDateString();
  }
}

class Bank {
  constructor() {
    this.clients = [];
  }

  addClient(clientData) {
    let client = new Client(clientData);
    this.clients.push(client);
    return client;
  }

  createDebetAccount(identificationNumber, debetData) {
    let currentClient = this.clients.
      find(client => client.identificationNumber === identificationNumber);
    let account = new DebetAccount(debetData);
    currentClient.debitAccounts.push(account);
  }

  createCreditAccount(identificationNumber, creditData) {
    let currentClient = this.clients.
      find(client => client.identificationNumber === identificationNumber);
    let account = new CreditAccount(creditData);
    currentClient.creditAccounts.push(account);
  }

  countMoneyAmount(currencyType) {
    let moneyAmount = {};
    for (let client of this.clients) {
      for (let account of client.debitAccounts) {
        if (!moneyAmount[account.currencyType]) {
          moneyAmount[account.currencyType] = 0;
        }
        moneyAmount[account.currencyType] += account.balance;
      }
      for (let account of client.creditAccounts) {
        if (!moneyAmount[account.currencyType]) {
          moneyAmount[account.currencyType] = 0;
        }
        moneyAmount[account.currencyType] += account.balance;
      }
    }
    let sumUah = moneyAmount["UAH"];
    let rate;
    for (let currancy of JSON.parse(localStorage.currancyCourse)) {
      for (let item in moneyAmount) {
        if (currancy.ccy === item) {
          sumUah += moneyAmount[currancy.ccy] * currancy.sale;
        }
        if (currancy.ccy === currencyType) {
          rate = currancy.sale;
        }
      }
    }
    return sumUah / rate;
  }

  countCommonCreditMoney(currencyType) {
    let commonCreditMoney = {};
    for (let client of this.clients) {
      for (let account of client.creditAccounts) {
        if (!commonCreditMoney[account.currencyType]) {
          commonCreditMoney[account.currencyType] = 0;
        }
        if (account.limit > account.balance) {
          commonCreditMoney[account.currencyType] +=
            account.limit - account.balance;
        }
      }
    }
    let sumUah = commonCreditMoney["UAH"];
    let rate;
    for (let currancy of JSON.parse(localStorage.currancyCourse)) {
      for (let item in commonCreditMoney) {
        if (currancy.ccy === item) {
          sumUah += commonCreditMoney[currancy.ccy] * currancy.sale;
        }
        if (currancy.ccy === currencyType) {
          rate = currancy.sale;
        }
      }
    }
    return sumUah / rate;
  }

  countCreditMoney(currencyType, isActive) {
    let creditMoney = {};
    for (let client of this.clients) {
      for (let account of client.creditAccounts) {
        if (!creditMoney[account.currencyType]) {
          creditMoney[account.currencyType] = 0;
        }
        if (client.isActiveClient === isActive) {
          if (account.limit > account.balance) {
            creditMoney[account.currencyType] +=
              account.limit - account.balance;
          }
        }
      }
    }
    let sumUah = creditMoney["UAH"];
    let rate;
    for (let currancy of JSON.parse(localStorage.currancyCourse)) {
      for (let item in creditMoney) {
        if (currancy.ccy === item) {
          sumUah += creditMoney[currancy.ccy] * currancy.sale;
        }
        if (currancy.ccy === currencyType) {
          rate = currancy.sale;
        }
      }
    }
    return sumUah / rate;
  }

  async getCurses() {
    return fetch('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
      .then(response => response.json())
      .then((response) => {
        let uahCourse = { ccy: 'UAH', base_ccy: 'UAH', buy: '1.00', sale: '1.00' };
        response.push(uahCourse);
        localStorage.setItem('currancyCourse', JSON.stringify(response));
      })
      .catch(error => console.error(error));
  }
}