'use client';
import React, { useCallback, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { InitialParameters } from './InitialParameters';
import { Client } from './Client';
import { Agency } from './Agency';
// Brief and Specifications are commented out - will be used by Client later
// import { Brief } from './Brief';
// import { Specifications } from './Specifications';
import { GuidanceAndControls } from '../common/GuidanceAndControls';
import { Wrapper, Section, Header, Column, Content } from '../common/styled';
import { Form, message } from 'antd';
import { useMutateProject, ProjectFormData } from '@/hooks/useMutateProject';
import { useBrief } from '@/hooks/useBrief';
import { GuidanceProvider } from '@/context/GuidanceProvider';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMode, selectProjectId } from '@/store/slices/project';
import { NEW_BRIEF_SLUG } from '@/constants/constants';
import { initialValues } from './initialValues';
import { t } from '@/lib/i18n';
import logger from '@/lib/logger';
import { AppRoute } from '@/constants/appRoute';
import { projectsApi } from '@/services/client/projectsApi';
import { useApplyTemplateMutation } from '@/services/client/templatesApi';
import { offersApi } from '@/services/client/offersApi';
import { useGetVendorSettingsQuery } from '@/services/client/vendorSettingsApi';

export default function Details() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const routeProjectId = params.projectId as string | undefined;
  const storedProjectId = useAppSelector(selectProjectId);
  const { create, update, isLoading: isMutating } = useMutateProject();
  const [uploadThumbnail] = projectsApi.useUploadThumbnailMutation();
  const [applyTemplate] = useApplyTemplateMutation();
  const { data: brief, isLoading } = useBrief();
  const { data: vendorSettings } = useGetVendorSettingsQuery();
  const isExistingProject = !!routeProjectId && routeProjectId !== NEW_BRIEF_SLUG;
  const { data: existingProject, isFetching: isProjectFetching } = projectsApi.useGetProjectByIdQuery(
    routeProjectId ?? '',
    {
      skip: !isExistingProject,
      refetchOnMountOrArgChange: true,
    }
  );
  const [form] = Form.useForm<ProjectFormData>();
  const [messageApi, context] = message.useMessage();
  const router = useRouter();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    if (existingProject) {
      initializedRef.current = true;
      form.setFieldsValue({
        ...initialValues,
        crmId: existingProject.crmId || '',
        projectName: existingProject.name || '',
        description: existingProject.description || '',
        clientId: existingProject.clientId || null,
        clientName: existingProject.clientName || '',
        irsEin: existingProject.irsEin || '',
        brandName: existingProject.brandName || '',
        agencyName: existingProject.agencyName || '',
        collaborators:
          existingProject.collaborators?.map((c) => ({
            userId: c.userId || null,
            name: c.name,
            email: c.email,
            role: c.role,
          })) || [],
        managers: existingProject.clientManagers?.map((m) => ({
          name: m.name,
          position: m.position,
        })) || [{ name: '', position: '' }],
      });
    } else if (!isLoading && brief && typeof brief.details === 'object') {
      initializedRef.current = true;
      const details = brief.details;
      form.setFieldsValue({
        ...initialValues,
        crmId: details.crmId || '',
        projectName: details.projectName || '',
        description: details.description || '',
        clientName: details.clientName || '',
        irsEin: details.irsEin || '',
        brandName: details.brandName || '',
        managers: details.managers?.map((m: { manager?: string; name?: string; position?: string }) => ({
          name: m.manager || m.name || '',
          position: m.position || '',
        })) || [{ name: '', position: '' }],
        collaborators:
          details.collaborators?.map((c: string) => ({
            name: c,
            email: '',
            role: 'internal_user' as const,
          })) || [],
      });
    } else if (!isLoading && !isProjectFetching) {
      initializedRef.current = true;
    }
  }, [brief, existingProject, form, isLoading, isProjectFetching]);

  useEffect(() => {
    if (isExistingProject) return;
    if (isLoading || isProjectFetching) return;
    if (!vendorSettings) return;
    const currentAgencyName = form.getFieldValue('agencyName') as string;
    if (!currentAgencyName) {
      form.setFieldsValue({
        agencyName: vendorSettings.agencyName || '',
      });
    }
  }, [vendorSettings, form, isExistingProject, isLoading, isProjectFetching]);

  const handleSubmit = useCallback(
    async (formData: ProjectFormData) => {
      try {
        let projectId: string | undefined;

        const effectiveProjectId = routeProjectId ?? storedProjectId;
        if (isExistingProject && existingProject && effectiveProjectId) {
          await update(effectiveProjectId, formData);
          projectId = effectiveProjectId;
        } else {
          // Create new project + offer (without Brief!)
          const data = await create(formData);
          projectId = data.projectId;

          if (!projectId) {
            throw new Error('Project ID not returned from create');
          }
        }

        // Apply template if selected (only for new projects)
        const templateId = form.getFieldValue('estimationTemplate') as string | undefined;
        const isTemplateApplied = !!(templateId && !existingProject && projectId);
        if (isTemplateApplied) {
          try {
            await applyTemplate({ templateId, projectId }).unwrap();
            dispatch(offersApi.util.invalidateTags(['Offer']));
          } catch (err) {
            logger.error('Error applying template:', err);
          }
        }

        // Upload thumbnail if a file was selected
        const thumbnailFile = form.getFieldValue('previewImage') as File | null;
        if (thumbnailFile && projectId) {
          try {
            await uploadThumbnail({ projectId, file: thumbnailFile }).unwrap();
          } catch (err) {
            logger.error('Error uploading thumbnail:', err);
          }
        }

        messageApi.success(t('DETAILS_SAVED_SUCCESSFULLY'));

        if (projectId) {
          dispatch(setMode('view'));
          if (isTemplateApplied) {
            router.push(AppRoute.DASHBOARD_PROJECT_ESTIMATION(projectId));
          } else {
            router.push(AppRoute.DASHBOARD_PROJECT_DETAILS(projectId));
          }
        } else {
          messageApi.error(t('ERROR_SAVING_DETAILS'));
        }
      } catch (error) {
        logger.error('Error saving project:', error);
        messageApi.error((error as { data?: { message?: string } })?.data?.message || t('ERROR_SAVING_DETAILS'));
      }
    },
    [
      applyTemplate,
      create,
      dispatch,
      existingProject,
      form,
      isExistingProject,
      messageApi,
      routeProjectId,
      router,
      storedProjectId,
      update,
      uploadThumbnail,
    ]
  );

  return (
    <GuidanceProvider>
      {context}
      <Form<ProjectFormData>
        form={form}
        layout='vertical'
        disabled={isMutating}
        size='large'
        initialValues={initialValues}
        onFinish={handleSubmit}
        scrollToFirstError
        clearOnDestroy
      >
        <Wrapper>
          <Column style={{ flex: '1 1 70%' }}>
            <Section>
              <Header>{t('INITIAL_PARAMETERS')}</Header>
              <Content>
                <InitialParameters thumbnailUrl={existingProject?.thumbnailUrl} />
              </Content>
            </Section>
            <Section>
              <Header>{t('THE_CLIENT')}</Header>
              <Content>
                <Client />
              </Content>
            </Section>
            <Section>
              <Header>{t('THE_AGENCY')}</Header>
              <Content>
                <Agency />
              </Content>
            </Section>
            {/* Brief and Specifications sections commented out - will be used by Client later
            <Section>
              <Header>{t('THE_CLIENTS_BRIEF')}</Header>
              <Content>
                <Brief />
              </Content>
            </Section>
            <Section>
              <Header>{t('RIGHTS_AND_TECHNICAL_SPECIFICATIONS')}</Header>
              <Content>
                <Specifications />
              </Content>
            </Section>
            */}
          </Column>
          <Column style={{ flex: '1 1 30%', justifyContent: 'space-between' }}>
            <GuidanceAndControls />
          </Column>
        </Wrapper>
      </Form>
    </GuidanceProvider>
  );
}
