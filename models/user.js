module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      refreshTokens: {
        type: DataTypes.STRING, // Store as JSON string
        allowNull: true,
      }
    });
  
    return User;
};