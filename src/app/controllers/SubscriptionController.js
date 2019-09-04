import Meetapp from '../models/Meetapp';
import User from '../models/User';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetapp = await Meetapp.findByPk(req.params.meetappId);

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
    console.log('chegou aqui');

    const subscribe = await Subscription.create({
      meetapp_id: meetapp.id,
      user_id: user.id,
    });

    return res.json(subscribe);
  }

  async index(req, res) {
    return res.json();
  }
}

export default new SubscriptionController();
