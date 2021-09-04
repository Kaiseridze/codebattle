import React, { memo } from 'react';

import TournamentChatInput from '../components/TournamentChatInput';
import Messages from '../components/Messages';

const TournamentChat = ({ messages }) => (
  <div
    className="sticky-top bg-white"
    style={{ height: '350px', maxWidth: '307px' }}
  >
    <div
      className="rounded-top shadow-sm"
      style={{ height: '350px', maxWidth: '307px' }}
    >
      <div
        className="overflow-auto px-3 pt-3 h-100 text-break"
        id="new-chat-message"
      >
        <div>
          <small className="text-muted">Please, be nice in chat</small>
        </div>
        <Messages messages={messages} />
      </div>
    </div>
    <TournamentChatInput />
  </div>
);

export default memo(TournamentChat);
