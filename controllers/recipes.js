const Recipe = require('../models/recipe');
const { NotFoundError, UnauthorizedError } = require('../errors/errors');
const {
  recipeNotFound,
  notAuthorized,
  recipeUpdated,
  recipeRemoved,
} = require('../messages');

module.exports.getSavedRecipes = (req, res, next) => {
  const owner = req.user._id;

  Recipe.find({ owner, recipeId: { $gt: 0 } })
    .then((recipes) => res.send(recipes))
    .catch(next);
};

module.exports.getMyRecipes = (req, res, next) => {
  const owner = req.user._id;

  Recipe.find({ owner, source: 'myRecipe' })
    .then((recipes) => res.send(recipes))
    .catch(next);
};

module.exports.addRecipe = (req, res, next) => {
  const {
    title,
    recipeId,
    image,
    time,
    source,
    servings,
    dairyFree,
    glutenFree,
    vegan,
    vegetarian,
    ingredients,
    instructions,
  } = req.body;
  const owner = req.user._id;

  Recipe.create({
    title,
    recipeId,
    image,
    time,
    source,
    servings,
    dairyFree,
    glutenFree,
    vegan,
    vegetarian,
    ingredients,
    instructions,
    owner,
  })
    .then((recipe) => res.status(201).send(recipe))
    .catch(next);
};

module.exports.updateRecipe = (req, res, next) => {
  const id = req.params.recipeId;
  const update = req.body;

  Recipe.updateOne({ _id: id }, update)
    .then((recipe) => {
      if (!recipe) {
        return Promise.reject(new NotFoundError(recipeNotFound));
      }
    })
    .then(() => res.send({ message: recipeUpdated }))
    .catch(next);
};

module.exports.removeRecipe = (req, res, next) => {
  const query =
    typeof req.params.recipeId === 'number'
      ? { recipeId: req.params.recipeId }
      : { _id: req.params.recipeId };

  Recipe.findOne(query)
    .select('+owner')
    .then((recipe) => {
      if (!recipe) {
        return Promise.reject(new NotFoundError(recipeNotFound));
      }
      if (recipe.owner.toString() !== req.user._id) {
        return Promise.reject(new UnauthorizedError(notAuthorized));
      }
      Recipe.findOneAndRemove(query)
        .then(() => res.send({ message: recipeRemoved }))
        .catch(next);
    })
    .catch(next);
};
