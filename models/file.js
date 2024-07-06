module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        extension: {
          type: DataTypes.STRING,
          allowNull: false
        },
        mimeType: {
          type: DataTypes.STRING,
          allowNull: false
        },
        size: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        uploadDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      });
  
    return File;
  };