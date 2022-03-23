module.exports.username = 
{
  IS_EMPTY: 'Must not be empty',
  IS_EXISTS: 'Username already exists',
  LENGTH_TOO_LONG: 'Username too long (maximum 50 characters long)',
  START_WITH_DASH_OR_UNDERSCORE: 'Must not start with a number or signs "-", "_"',
  END_WITH_DASH_OR_UNDERSCORE: 'Must not end with signs "-", "_"',
  CONTAINS_INVALID_CHARACTERS: 'Contains invalid characters',
  DISALLOWED_USERNAME: 'This username isn\'t allowed.'
}

module.exports.password = 
{
  IS_EMPTY: this.username.IS_EMPTY,
  LENGTH_TOO_SHORT: 'Password too short. At least 8 characters.',
  LENGTH_TOO_LONG: 'Password too long (maximum 50 characters long)',
}

module.exports.repeatPassword =
{
  IS_EMPTY: this.username.IS_EMPTY,
  NOT_MATCHED_WITH_PASSWORD_ABOVE: 'Not match with password above',
}

module.exports.firstName =
{
  IS_EMPTY: this.username.IS_EMPTY,
  LENGTH_TOO_LONG: 'Name too long (maximum 30 characters long)',
  IS_MEANINGLESS_NAME: 'Invalid name',
}

module.exports.lastName =
{
  IS_EMPTY: this.firstName.IS_EMPTY,
  LENGTH_TOO_LONG: this.firstName.LENGTH_TOO_LONG,
  IS_MEANINGLESS_NAME: this.firstName.IS_MEANINGLESS_NAME,
}

module.exports.emailAddress = 
{
  IS_EMPTY: this.username.IS_EMPTY,
  IS_EXISTS: 'Email already exists',
  LENGTH_TOO_LONG: 'Email too long. (maximum 50 characters long)',
  INVALID_EMAIL_PATTERN: 'Not a valid email',
  INVALID_LOCAL_PART: 'Your local part email too long. Therefore, your email is not valid.',
  INVALID_DOMAIN_PART: 'Your domain part email too long. Therefore, your email is not valid.',
}

module.exports.phoneNumber = 
{
  IS_EMPTY: this.username.IS_EMPTY,
  LENGTH_TOO_LONG: 'Phone number is too long. (maximum 15 digits)',
  INVALID_PHONE_NUMBER_PATTERN: 'Not a valid phone number',
}
