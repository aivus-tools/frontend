'use client';

import { EmailAgentSubnav } from '@/modules/vendor/emailAgent/EmailAgentSubnav/EmailAgentSubnav';
import { AgentSettingsForm } from '@/modules/vendor/emailAgent/AgentSettingsForm/AgentSettingsForm';

export default function Page() {
  return (
    <>
      <EmailAgentSubnav active='settings' />
      <AgentSettingsForm />
    </>
  );
}
