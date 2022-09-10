import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import Authenticate from '.';
import CenterView from '../CenterView';

storiesOf('Authenticate', module)
  .addDecorator((getStory) => <CenterView>{getStory()}</CenterView>)
  .add('with text', () => (
    <Authenticate onSignIn={action('change-jwt')} />
  ));
