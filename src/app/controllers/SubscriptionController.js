import { Op } from 'sequelize';

import Meetapp from '../models/Meetapp';
import User from '../models/User';
import Subscription from '../models/Subscription';
import File from '../models/File';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

class SubscriptionController {
  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetapp = await Meetapp.findByPk(req.params.meetappId, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (meetapp.user_id === user.id) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to your own meetups" });
    }

    if (meetapp.past === true) {
      return res.status(400).json({ error: "Can't subscribe to past meetups" });
    }

    const mySubscriptions = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetapp,
          as: 'meetapp',
          required: true,
          where: {
            date: meetapp.date,
          },
        },
      ],
    });

    if (mySubscriptions) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same time" });
    }

    const subscribe = await Subscription.create({
      meetapp_id: meetapp.id,
      user_id: user.id,
    });

    await Queue.add(SubscriptionMail.key, {
      meetapp,
      user,
    });

    return res.json(subscribe);
  }

  async index(req, res) {
    const user = await req.userId;
    const meetapp = await Subscription.findAll({
      where: { user_id: user },
      attributes: ['id', 'user_id', 'meetapp_id'],
      include: [
        {
          model: Meetapp,
          as: 'meetapp',
          order: [[Meetapp, 'date']],
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          attributes: ['id', 'title', 'description', 'location', 'date'],
          include: [
            {
              model: File,
              as: 'banner',
              attributes: ['id', 'name', 'path', 'url'],
            },
            {
              model: User,
              as: 'organizer',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    return res.json(meetapp);
  }

  async delete(req, res) {
    const meetapp = await Subscription.findByPk(req.params.id);

    if (meetapp.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this meetapp",
      });
    }

    await meetapp.destroy();

    return res.json(meetapp);
  }
}

export default new SubscriptionController();
