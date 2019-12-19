const path = require('path');
const express = require('express');
const ZebralogsService = require('./zebralogs-service');

const zebralogsRouter = express.Router();
const jsonParser = express.json();

const serializeZebralogs = zebralog => ({
    id: zebralog.id,
    game_date: zebralog.game_date,
    site: zebralog.site,
    distance: zebralog.distance,
    paid: zebralog.paid,
    type: zebralog.type,
    amount: zebralog.amount,
    notes: zebralog.notes,
})

zebralogsRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        ZebralogsService.getAllZebralogs(knexInstance)
            .then(zebralogs => {
                res.json(zebralogs.map(serializeZebralogs))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { game_date, site, distance, paid, type, amount, notes } = req.body
        const newZebralog = { game_date, site, distance, paid, type, amount, notes }

        for (const [key, value] of Object.entries(newZebralog))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
        ZebralogsService.insertZebralog(
            req.app.get('db'),
            newZebralog
        )
            .then(zebralog => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${zebralog.id}`))
                    .json(serializeZebralogs(zebralog))
            })
            .catch(next)
    })

zebralogsRouter
    .route('/:zebralog_id')
    .all((req, res, next) => {
        ZebralogsService.getZebralogById(
            req.app.get('db'),
            req.params.zebralog_id
        )
        .then(zebralog => {
            if (!zebralog) {
                return res.status(404).json({
                    error: { message: `Log doesn't exist` }
                })
            }
            res.zebralog = zebralog // save the log for the next middleware
            next() // don't forget to call next so the next middleware happens!
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeZebralogs(res.zebralog))
    })
    .delete((req, res, next) => {
        ZebralogsService.deleteZebralog(
            req.app.get('db'),
            req.params.zebralog_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { game_date, site, distance, paid, type, amount, notes } = req.body
        const zebralogsToUpdate = { game_date, site, distance, paid, type, amount, notes }
  
        const numberOfValues = Object.values(zebralogsToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'game_date', 'site', 'distance', 'paid', 'type', 'amount', or 'notes'`
                }
            })
        }
  
        ZebralogsService.updateZebralog(
            req.app.get('db'),
            req.params.zebralog_id,
            zebralogsToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
  
module.exports = zebralogsRouter