// Imports
const jwtUtils = require('../utils/jwt.utils');
const models = require('../models');
const asyncLib = require('async');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// Routes
module.exports = {

    addNew: (req, res) => {
        let headerAuth = req.headers['authorization'];
        let user = jwtUtils.getUserId(headerAuth);

        let key = req.body.key;
        let value = req.body.value;
        let isSecure = req.body.isSecure;
        let createdBy = req.body.createdBy;
        let patient = req.body.patient;

        if (user < 0)
            return res.status(401).json({
                'status': 'Unauthorized',
                'code': 401,
                'message': 'Une authentification complète est nécessaire pour accéder à cette ressource'
            });

        asyncLib.waterfall([
            (done) => {
                models.Antecedent.findOne({
                    where: {
                        key: key,
                        value: value,
                        patientId: patient
                    }
                }).then((antecedentFound) => {
                    done(null, antecedentFound);
                }).catch((err) => {
                    return res.status(500).json({
                        'status': 'Error',
                        'code': 500,
                        'message': err
                    });
                });
            },
            (antecedentFound, done) => {
                if (!antecedentFound) {
                    done(null, antecedentFound);
                } else {
                    return res.status(409).json({
                        'status': 'Failed',
                        'code': 409,
                        'message': 'Cet antécédent existe déjà'
                    });
                }
            },
            (antecedentFound, done) => {
                let newAntecedent = models.Antecedent.create({
                    key: key,
                    value: value,
                    isSecure: isSecure,
                    createdBy: createdBy,
                    PatientId: patient
                }).then((newAntecedent) => {
                    done(newAntecedent);
                }).catch((err) => {
                    return res.status(500).json({
                        'status': 'Error',
                        'code': 500,
                        'message': err
                    });
                });
            }
        ], (newAntecedent) => {
            if (newAntecedent) {
                return res.status(201).json({
                    'status': 'success',
                    'code': 201,
                    'data': newAntecedent
                });
            } else {
                return res.status(500).json();
            }
        });

    },

    getAllByPatient: (req, res) => {
        let headerAuth = req.headers['authorization'];
        let user = jwtUtils.getUserId(headerAuth);
        let patient = req.params.id;

        if (user < 0)
            return res.status(401).json({
                'status': 'Unauthorized',
                'code': 401,
                'message': 'Une authentification complète est nécessaire pour accéder à cette ressource'
            });

        models.Antecedent.findAll({
            where: { patientId: patient },
            order: [['key', 'asc']]
        }).then((result) => {
            if (result) {
                return res.status(201).json({
                    'status': 'Success',
                    'code': 201,
                    'data': result
                });
            } else {
                res.status(404).json({
                    'status': 'Not found',
                    'code': 404,
                    'message': 'Impossible de trouver un ou plusieurs antécédents'
                });
            }
        }).catch((err) => {
            return res.status(500).json({
                'status': 'Error',
                'code': 500,
                'message': err
            });
        });
    },

    update: (req, res) => {
        let headerAuth = req.headers['authorization'];
        let user = jwtUtils.getUserId(headerAuth);
        let mesureId = req.params.id;

        if (user < 0)
            return res.status(401).json({
                'status': 'Unauthorized',
                'code': 401,
                'message': 'Une authentification complète est nécessaire pour accéder à cette ressource'
            });

        let key = req.body.key;
        let value = req.body.value;
        let createdBy = req.body.createdBy;
        let patient = req.body.patient;

        asyncLib.waterfall([
            (done) => {
                models.Antecedent.findOne({
                    where: { id: mesureId }
                })
                    .then((antecedentFound) => {
                        done(null, antecedentFound);
                    })
                    .catch((err) => {
                        return res.status(500).json({
                            'status': 'Error',
                            'code': 500,
                            'message': err
                        });
                    })
            },
            (antecedentFound, done) => {
                if (antecedentFound) {
                    antecedentFound.update({
                        key: (key ? code : antecedentFound.key),
                        value: (value ? value : antecedentFound.value),
                        createdBy: (createdBy ? createdBy : antecedentFound.createdBy),
                        devise: (devise ? devise : antecedentFound.devise),
                        patientId: (patient ? patient : antecedentFound.patientId)
                    }, {
                        where: { id: antecedentFound.id }
                    })
                        .then((mesureUpdated) => {
                            done(mesureUpdated);
                        })
                        .catch((err) => {
                            return res.status(500).json({
                                'status': 'Error',
                                'code': 500,
                                'message': err
                            });
                        })
                }
            }
        ], (mesureUpdated) => {
            if (mesureUpdated) {
                return res.status(201).json({
                    'status': 'success',
                    'code': 201,
                    'data': mesureUpdated
                });
            } else {
                return res.status(500).json();
            }
        });
    },

    delete: (req, res) => {
        let headerAuth = req.headers['authorization'];
        let user = jwtUtils.getUserId(headerAuth);
        let mesureId = req.params.id;

        if (user < 0)
            return res.status(401).json({
                'status': 'Unauthorized',
                'code': 401,
                'message': 'Une authentification complète est nécessaire pour accéder à cette ressource'
            });

        asyncLib.waterfall([
            (done) => {
                models.Antecedent.findOne({
                    where: { id: mesureId }
                })
                    .then((antecedentFound) => {
                        done(null, antecedentFound);
                    })
                    .catch((err) => {
                        return res.status(500).json({
                            'status': 'Error',
                            'code': 500,
                            'message': err
                        });
                    });
            },
            (antecedentFound, done) => {
                if (antecedentFound) {
                    models.Antecedent.destroy({
                        where: { id: antecedentFound.id }
                    })
                        .then((mesureDeleted) => {
                            done(mesureDeleted)
                        })
                        .catch((err) => {
                            return res.status(500).json({
                                'status': 'Error',
                                'code': 500,
                                'message': err
                            });
                        });
                } else {
                    return res.status(404).json({
                        'status': 'Not found',
                        'code': 404,
                    });
                }
            }
        ], (mesureDeleted) => {
            if (mesureDeleted) {
                return res.status(201).json({
                    'status': 'success',
                    'code': 201
                });
            } else {
                return res.status(500).json();
            }
        })
    }
}