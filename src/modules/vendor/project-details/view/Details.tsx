'use client';
import { ReactNode } from 'react';
import { useParams } from 'next/navigation';

import { GuidanceAndControls } from '../common/GuidanceAndControls';
import commonStyles from '../common/common.module.css';
import { Col, Flex, Image, Row, Typography } from 'antd';
import { GuidanceProvider } from '@/context/GuidanceProvider';
import { PageSpinner } from '@/components/PageSpinner';
import HouseIcon from '@/icons/house.svg';
import { t } from '@/lib/i18n';
import { projectsApi } from '@/services/client/projectsApi';
import { NEW_BRIEF_SLUG } from '@/constants/constants';

import styles from './Details.module.css';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  internal_user: 'Internal User',
  external_user: 'External User',
  producer: 'Producer',
  agency_producer: 'Agency Producer',
};

interface ItemProps {
  label?: string;
  value?: string | ReactNode;
}

const Item = (props: ItemProps) => (
  <Flex gap={4} justify='center' vertical>
    {props.label && <Typography.Text className={styles.label}>{props.label}</Typography.Text>}
    {props.value ? (
      <Typography.Text className={styles.text}>{props.value}</Typography.Text>
    ) : (
      <Typography.Text className={styles.textEmpty}>{t('EMPTY')}</Typography.Text>
    )}
  </Flex>
);

export default function Details() {
  const params = useParams();
  const projectId = params.projectId as string | undefined;
  const {
    data: project,
    isLoading,
    isFetching,
  } = projectsApi.useGetProjectByIdQuery(projectId ?? '', {
    skip: !projectId || projectId === NEW_BRIEF_SLUG,
    refetchOnMountOrArgChange: true,
  });

  if (isLoading || isFetching) {
    return <PageSpinner />;
  }

  if (!project) {
    return null;
  }

  return (
    <GuidanceProvider>
      <div className={commonStyles.wrapper}>
        <div className={commonStyles.column} style={{ flex: '1 1 70%' }}>
          <div className={commonStyles.section}>
            <div className={commonStyles.header}>{t('INITIAL_PARAMETERS')}</div>
            <div className={commonStyles.content} style={{ minWidth: '584px' }}>
              <Flex gap={30} align='start'>
                {project.thumbnailUrl ? (
                  <div className={styles.thumbnail}>
                    <Image
                      src={project.thumbnailUrl}
                      alt={t('THUMBNAIL')}
                      width={104}
                      height={104}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <HouseIcon />
                )}
                <Flex gap={20} align='center' style={{ flex: 1 }}>
                  <Item label={t('CRM_ID_LINK')} value={project.crmId} />
                </Flex>
              </Flex>
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
                              {collaborator.role ? (
                                <Typography.Text type='secondary'>
                                  {' '}
                                  - {ROLE_LABELS[collaborator.role] || collaborator.role}
                                </Typography.Text>
                              ) : null}
                              <br />
                            </span>
                          ))
                        : undefined
                    }
                  />
                </Col>
              </Row>
            </div>
          </div>
          <div className={commonStyles.section}>
            <div className={commonStyles.header}>{t('THE_CLIENT')}</div>
            <div className={commonStyles.content}>
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
            </div>
          </div>
          <div className={commonStyles.section}>
            <div className={commonStyles.header}>{t('THE_AGENCY')}</div>
            <div className={commonStyles.content}>
              <Row align='middle' style={{ marginTop: 20 }}>
                <Col span={12}>
                  <Item label={t('AGENCY_NAME')} value={project.agencyName} />
                </Col>
              </Row>
              {project.collaborators &&
                project.collaborators.filter((x) => x.role === 'agency_producer').length > 0 && (
                  <Row align='middle' style={{ marginTop: 20 }}>
                    <Col span={12}>
                      <Item
                        label={t('AGENCY_PRODUCERS')}
                        value={project.collaborators
                          .filter((x) => x.role === 'agency_producer')
                          .map((x) => (
                            <span key={x.id}>
                              {x.name || x.email}
                              <br />
                            </span>
                          ))}
                      />
                    </Col>
                  </Row>
                )}
            </div>
          </div>
        </div>
        <div className={commonStyles.column} style={{ flex: '1 1 30%', justifyContent: 'space-between' }}>
          <GuidanceAndControls />
        </div>
      </div>
    </GuidanceProvider>
  );
}
