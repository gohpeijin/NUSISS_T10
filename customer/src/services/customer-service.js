const { CustomerRepository } = require('../database');
const {
  FormateData,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} = require('../utils');

class CustomerService {
  constructor() {
    this.repository = new CustomerRepository();
  }

  async SignIn(userInputs) {
    const { email, password } = userInputs;

    const existingCustomer = await this.repository.FindCustomer({ email });

    if (existingCustomer) {
      const validPassword = await ValidatePassword(
        password,
        existingCustomer.password,
        existingCustomer.salt
      );
      if (validPassword) {
        const token = await GenerateSignature({
          email: existingCustomer.email,
          _id: existingCustomer._id,
        });
        return FormateData({
          id: existingCustomer._id,
          token,
          role: existingCustomer.role,
        });
      }
    }

    return FormateData(null);
  }

  async SignUp(userInputs) {
    const { email, password, phone, role } = userInputs;

    // create salt
    let salt = await GenerateSalt();

    let userPassword = await GeneratePassword(password, salt);

    const existingCustomer = await this.repository.FindCustomer({ email });

    if (existingCustomer) return FormateData(null);

    const newCustomer = await this.repository.CreateCustomer({
      email,
      password: userPassword,
      phone,
      role,
      salt,
    });

    const token = await GenerateSignature({
      email: email,
      _id: newCustomer._id,
    });

    return {
      data: { id: newCustomer._id, token, role },
      payload: role === "buyer"?{
        event: 'CREATE_PROFILE',
        data: { userId: newCustomer._id },
      }: null,
    };
  }

  async AddNewAddress(_id, userInputs) {
    const { street, postalCode, city, country } = userInputs;

    const addressResult = await this.repository.CreateAddress({
      _id,
      street,
      postalCode,
      city,
      country,
    });

    return FormateData(addressResult);
  }

  async GetProfile(id) {
    const existingCustomer = await this.repository.FindCustomerById({ id });
    return FormateData(existingCustomer);
  }

  async DeleteProfile(userId) {
    const data = await this.repository.DeleteCustomerById(userId);
    const payload = {
      event: 'DELETE_PROFILE',
      data: { userId },
    };
    return { data, payload };
  }
}

module.exports = CustomerService;
