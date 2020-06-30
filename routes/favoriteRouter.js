const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorite');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());


favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
.get(cors.cors, (req, res, next) => {
    Favorites.find({})
    .populate('user dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
    .then((favorites) => {
        if(favorites.length !== 0 ){
            req.body.map((object) => {
                if(favorites[0].dishes.indexOf(object._id) !== -1){
                    var err = new Error('Dish already added as favorite!');
                    res.statusCode = 403;
                    return next(err);
                }
                favorites[0].dishes.push(object._id);
                favorites[0].save()
                .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                }, (err) => next(err))
                .catch((err)=> next(err));
            })
        }
        else{
            Favorites.create({
                user: req.user._id,
                dishes: req.body
            })
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            },(err) => next(err))
            .catch((err) => next(err));
        }
    })
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites !');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorites.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    },(err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
.get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites !');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
    .then((favorites) => {
        if(favorites.length !== 0 ){
            if (favorites[0].dishes.indexOf(req.params.dishId) !== -1 ){
                var err = new Error('Dish already added as favorite!');
                res.statusCode = 403;
                return next(err);
            }
            favorites[0].dishes.push(req.params.dishId);
            favorites[0].save()
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{
            Favorites.create({
                user: req.user._id,
                dishes: [req.params.dishId]
            })
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            },(err) => next(err))
            .catch((err) => next(err));
        }
    })
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+Request.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
    .then((favorites) => {
        if (favorites[0].dishes.indexOf(req.params.dishId) !== -1 ){
            var index = favorites[0].dishes.indexOf(req.params.dishId);
            favorites[0].dishes.splice(index, 1);
            favorites[0].save()
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{
            var err = new Error("Dish Id not found in Favorites!");
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch((err) => next(err));
});

module.exports = favoriteRouter;
