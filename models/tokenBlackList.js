module.exports = (sequelize, DataTypes) => {
    const TokenBlackList = sequelize.define('TokenBlackList', {
        token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        deviceId: {
            type: DataTypes.STRING,
            allowNull: false,
        }
        });

    return TokenBlackList;
};