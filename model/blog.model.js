// creating the schema of the table using the sequilize

module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define('blog', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT, // string le certian portion pachi faldincha(less bit store gar cha ) so text use gareko
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });
  return Blog;
};
