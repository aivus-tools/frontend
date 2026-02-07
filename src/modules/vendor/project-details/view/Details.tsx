'use client';
import { ReactNode } from 'react';

import { GuidanceAndControls } from '../common/GuidanceAndControls';
import { Wrapper, Section, Header, Column, Content } from '../common/styled';
import { Col, Flex, Row, Typography } from 'antd';
import { GuidanceProvider } from '@/context/GuidanceProvider';
import Spinner from '@/components/Spinner';
import HouseIcon from '@/icons/house.svg';
import { styled } from 'styled-components';
import { t } from '@/lib/i18n';
import { projectsApi } from '@/services/client/projectsApi';
import { useAppSelector } from '@/store/hooks';
import { selectProjectId } from '@/store/slices/project';

interface Props {
  label?: string;
  value?: string | ReactNode;
}

const Label = styled(Typography.Text)`
  font-weight: 400;
  font-size: 14px;
  line-height: 17.07px;
`;

const Text = styled(Typography.Text)`
  font-weight: 600;
  font-size: 14px;
  line-height: 17.07px;
`;

const TextEmpty = styled(Typography.Text)`
  font-weight: 600;
  font-size: 14px;
  line-height: 17.07px;
  color: #d9d9d9 !important;
`;

const Item = ({ label, value }: Props) => (
  <Flex gap={4} justify='center' vertical>
    {label && <Label>{label}</Label>}
    {value ? <Text>{value}</Text> : <TextEmpty>{t('EMPTY')}</TextEmpty>}
  </Flex>
);

export default function Details() {
  const projectId = useAppSelector(selectProjectId);
  const { data: project, isLoading } = projectsApi.useGetProjectByIdQuery(projectId || '', {
    skip: !projectId,
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (!project) {
    return null;
  }

  return (
    <GuidanceProvider>
      <Wrapper>
        <Column style={{ flex: '1 1 70%' }}>
          <Section>
            <Header>{t('INITIAL_PARAMETERS')}</Header>
            <Content style={{ minWidth: '584px' }}>
              <Row align='middle'>
                <Col span={12}>
                  <Flex gap={20} align='center'>
                    <HouseIcon />
                    <Item label={t('CRM_ID_LINK')} value={project.crmId} />
                  </Flex>
                </Col>
              </Row>
              <Row align='middle' style={{ marginTop: 20 }}>
                <Col span={24}>
                  <Item label={t('PROJECT_NAME')} value={project.name} />
                </Col>
              </Row>
              <Row align='middle' style={{ marginTop: 20 }}>
                <Col span={24}>
                  <Item label={t('DESCRIPTION')} value={project.description} />
                </Col>
              </Row>
              <Row align='middle' style={{ marginTop: 20 }}>
                <Col span={12}>
                  <Item
                    label={t('COLLABORATORS')}
                    value={
                      project.collaborators && project.collaborators.length > 0
                        ? project.collaborators.map((collaborator) => (
                            <span key={collaborator.id}>
                              {collaborator.name || collaborator.email}
                              <br />
                            </span>
                          ))
                        : undefined
                    }
                  />
                </Col>
              </Row>
            </Content>
          </Section>
          <Section>
            <Header>{t('THE_CLIENT')}</Header>
            <Content>
              <Row align='middle' style={{ marginTop: 20 }}>
                <Col span={12}>
                  <Item label={t('CLIENT')} value={project.clientName} />
                </Col>
                <Col span={12}>
                  <Item label={t('IRS_EIN')} value={project.irsEin} />
                </Col>
              </Row>
              {project.clientManagers
                ?.filter((manager) => manager.name || manager.position)
                .map((manager, index) => (
                  <Row align='middle' style={{ marginTop: index === 0 ? 20 : 8 }} key={manager.id || index}>
                    <Col span={12}>
                      <Item label={index === 0 ? t('CLIENTS_MANAGERS') : undefined} value={manager.name} />
                    </Col>
                    <Col span={12}>
                      <Item label={index === 0 ? t('MANAGER_POSITION') : undefined} value={manager.position} />
                    </Col>
                  </Row>
                ))}
              <Row align='middle' style={{ marginTop: 20 }}>
                <Col span={12}>
                  <Item label={t('BRAND_NAME')} value={project.brandName} />
                </Col>
              </Row>
            </Content>
          </Section>
        </Column>
        <Column style={{ flex: '1 1 30%', justifyContent: 'space-between' }}>
          <GuidanceAndControls />
        </Column>
      </Wrapper>
    </GuidanceProvider>
  );
}
