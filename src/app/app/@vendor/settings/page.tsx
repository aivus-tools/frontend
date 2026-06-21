'use client';

import { SettingsForm } from '@/modules/shared/SettingsForm/SettingsForm';
import { VendorSettingsSection } from '@/modules/vendor/VendorSettingsSection/VendorSettingsSection';

export default function VendorSettingsPage() {
  return (
    <>
      <VendorSettingsSection />
      <SettingsForm />
    </>
  );
}
