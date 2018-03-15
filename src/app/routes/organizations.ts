/**
 * 組織ルーター
 *
 * @ignore
 */

import { Router } from 'express';
const organizationsRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

organizationsRouter.use(authentication);

organizationsRouter.get(
    '/movieTheater/:branchCode',
    permitScopes(['organizations', 'organizations.read-only']),
    validator,
    async (req, res, next) => {
        try {
            const repository = new sskts.repository.Organization(sskts.mongoose.connection);
            await repository.findMovieTheaterByBranchCode(req.params.branchCode).then((movieTheater) => {
                res.json(movieTheater);
            });
        } catch (error) {
            next(error);
        }
    });

organizationsRouter.get(
    '/movieTheater',
    permitScopes(['organizations', 'organizations.read-only']),
    validator,
    async (__, res, next) => {
        try {
            const repository = new sskts.repository.Organization(sskts.mongoose.connection);
            await repository.searchMovieTheaters({
            }).then((movieTheaters) => {
                res.json(movieTheaters);
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * レストラン検索
 */
organizationsRouter.get(
    '/restaurant',
    permitScopes(['organizations', 'organizations.read-only']),
    validator,
    async (__, res, next) => {
        try {
            res.json([
                {
                    typeOf: 'Restaurant',
                    aggregateRating: {
                        typeOf: 'AggregateRating',
                        ratingValue: 4,
                        reviewCount: 250
                    },
                    name: 'Asahiのおねえちゃん',
                    openingHours: [
                    ],
                    telephone: '',
                    url: 'https://example.com',
                    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrhpsOJOcLBwc1SPD9sWlinildy4S05-I2Wf6z2wRXnSxbmtRz',
                    hasMenu: [{
                        typeOf: 'Menu',
                        hasMenuSection: [{
                            typeOf: 'MenuSection',
                            name: 'Drinks',
                            description: '',
                            image: [
                                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrhpsOJOcLBwc1SPD9sWlinildy4S05-I2Wf6z2wRXnSxbmtRz',
                                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrhpsOJOcLBwc1SPD9sWlinildy4S05-I2Wf6z2wRXnSxbmtRz'
                            ],
                            hasMenuItem: [{
                                identifier: 'menuItemIdentifier',
                                typeOf: 'MenuItem',
                                name: 'ビール',
                                description: '',
                                offers: [{
                                    identifier: 'offerIdentifier',
                                    typeOf: 'Offer',
                                    price: 700,
                                    priceCurrency: 'JPY'
                                }]
                            }]
                        }]
                    }]
                },
                {
                    typeOf: 'Restaurant',
                    aggregateRating: {
                        typeOf: 'AggregateRating',
                        ratingValue: 4,
                        reviewCount: 250
                    },
                    name: 'KIRINのおねえちゃん',
                    openingHours: [
                    ],
                    telephone: '',
                    url: 'https://example.com',
                    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrhpsOJOcLBwc1SPD9sWlinildy4S05-I2Wf6z2wRXnSxbmtRz',
                    hasMenu: [{
                        typeOf: 'Menu',
                        hasMenuSection: [{
                            typeOf: 'MenuSection',
                            name: 'Drinks',
                            description: '',
                            image: [
                                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrhpsOJOcLBwc1SPD9sWlinildy4S05-I2Wf6z2wRXnSxbmtRz',
                                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrhpsOJOcLBwc1SPD9sWlinildy4S05-I2Wf6z2wRXnSxbmtRz'
                            ],
                            hasMenuItem: [{
                                identifier: 'menuItemIdentifier',
                                typeOf: 'MenuItem',
                                name: 'ビール',
                                description: '',
                                offers: [{
                                    identifier: 'offerIdentifier',
                                    typeOf: 'Offer',
                                    price: 700,
                                    priceCurrency: 'JPY'
                                }]
                            }]
                        }]
                    }]
                }
            ]);
        } catch (error) {
            next(error);
        }
    }
);

export default organizationsRouter;
