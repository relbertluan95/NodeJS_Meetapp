import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetapp, user } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${meetapp.organizer.name} <${meetapp.organizer.email}>`,
      subject: `Você tem um novo inscrito para uns de seus meetapps.`,
      template: 'subscription',
      context: {
        organizer: meetapp.organizer.name,
        meetapp: meetapp.title,
        user: user.name,
        email: user.email,
      },
    });
  }
}

export default new SubscriptionMail();
