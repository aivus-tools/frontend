'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import { v4 as uuidv4 } from 'uuid';
import ArrowIcon from '@/icons/arrow-icon.svg';
import AddIcon from '@/icons/add-icon.svg';
import CloseIcon from '@/icons/cross.svg';
import { t } from '@/lib/i18n';
import logger from '@/lib/logger';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectOfferMetaData, selectIsExternal, selectOfferDetails } from '@/store/slices/offer/selectors';
import { setMetaData, recalculateAllOffers, setCategoryExternalMarkup } from '@/store/slices/offer/slice';
import { useUpdateOfferMutation } from '@/services/client/offersApi';
import { Offer, OfferDeliverable, OfferScheduleEntry } from '@/types/offer.interface';
import { RichTextEditor } from './RichTextEditor';
import { TERRITORY_OPTIONS, MEDIA_PLACEMENTS_OPTIONS, DURATION_UNITS, SCHEDULE_PHASES } from './constants';
import {
  MetaFormContainer,
  MetaFormHeader,
  MetaFormHeaderLeft,
  MetaFormHeaderTitle,
  ChevronIcon,
  MetaFormBody,
  FormRow,
  FormField,
  FieldLabel,
  FieldInput,
  FieldSelect,
  SectionHeader,
  SectionLabel,
  HintText,
  DynamicRow,
  InlineLabel,
  SmallInput,
  AddButton,
  RemoveButton,
  TagsContainer,
  Tag,
  TagRemove,
  TagInput,
  DeliverableNotesInput,
  ScheduleNotesInput,
} from './styled';

interface TagsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  placeholder?: string;
}

const TagsField: React.FC<TagsFieldProps> = (props) => {
  const { value, onChange, options } = props;
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableOptions = useMemo(() => {
    return options.filter((x) => !value.includes(x));
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) {
      return availableOptions;
    }
    return availableOptions.filter((x) => x.toLowerCase().includes(inputValue.toLowerCase()));
  }, [availableOptions, inputValue]);

  const handleAddTag = useCallback(
    (tag: string) => {
      if (!value.includes(tag)) {
        onChange([...value, tag]);
      }
      setInputValue('');
      setShowSuggestions(false);
    },
    [value, onChange]
  );

  const handleRemoveTag = useCallback(
    (tag: string) => {
      onChange(value.filter((x) => x !== tag));
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && inputValue.trim()) {
        event.preventDefault();
        handleAddTag(inputValue.trim());
      } else if (event.key === 'Backspace' && !inputValue && value.length > 0) {
        handleRemoveTag(value[value.length - 1]);
      }
    },
    [inputValue, value, handleAddTag, handleRemoveTag]
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (inputValue.trim()) {
        handleAddTag(inputValue.trim());
      }
      setShowSuggestions(false);
    }, 200);
  }, [inputValue, handleAddTag]);

  return (
    <div style={{ position: 'relative' }}>
      <TagsContainer onClick={() => inputRef.current?.focus()}>
        {value.map((x) => (
          <Tag key={x}>
            {x}
            <TagRemove
              onClick={(event) => {
                event.stopPropagation();
                handleRemoveTag(x);
              }}
            >
              <CloseIcon />
            </TagRemove>
          </Tag>
        ))}
        <TagInput
          ref={inputRef}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? props.placeholder || 'Type to search or add custom value' : ''}
        />
      </TagsContainer>
      {showSuggestions && filteredOptions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--white)',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 10,
            maxHeight: 300,
            overflow: 'auto',
          }}
        >
          {filteredOptions.map((x) => (
            <div
              key={x}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 14,
                color: '#4b5675',
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                handleAddTag(x);
              }}
            >
              {x}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const OfferMetaForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const metaData = useAppSelector(selectOfferMetaData);
  const offerDetails = useAppSelector(selectOfferDetails);
  const isExternal = useAppSelector(selectIsExternal);
  const [updateOffer] = useUpdateOfferMutation();

  const [isOpen, setIsOpen] = useState(true);
  const [bidDate, setBidDate] = useState<string>('');
  const [revision, setRevision] = useState('');
  const [bidVersionName, setBidVersionName] = useState('');
  const [term, setTerm] = useState('');
  const [territory, setTerritory] = useState<string[]>([]);
  const [mediaPlacements, setMediaPlacements] = useState<string[]>([]);
  const [coverPageNotes, setCoverPageNotes] = useState('');
  const [assumptionsExclusions, setAssumptionsExclusions] = useState('');
  const [fringesPercent, setFringesPercent] = useState('');
  const [handlingPercent, setHandlingPercent] = useState('');
  const [markupPercent, setMarkupPercent] = useState('');
  const [productionInsurancePercent, setProductionInsurancePercent] = useState('');
  const [productionFeePercent, setProductionFeePercent] = useState('');
  const [postMarkupPercent, setPostMarkupPercent] = useState('');
  const [postInsurancePercent, setPostInsurancePercent] = useState('');
  const [postTaxPercent, setPostTaxPercent] = useState('');
  const [deliverables, setDeliverables] = useState<OfferDeliverable[]>([]);
  const [scheduleEntries, setScheduleEntries] = useState<OfferScheduleEntry[]>([]);

  const lastMetaRef = useRef<unknown>(null);

  useEffect(() => {
    if (!metaData || metaData === lastMetaRef.current) {
      return;
    }
    lastMetaRef.current = metaData;
    setBidDate(metaData.bidDate || '');
    setRevision(metaData.revision || '');
    setBidVersionName(metaData.projectName || '');
    setTerm(metaData.term || '');
    setTerritory(metaData.territory || []);
    setMediaPlacements(metaData.mediaPlacements || []);
    setCoverPageNotes(metaData.coverPageNotes || '');
    setAssumptionsExclusions(metaData.assumptionsExclusions || '');
    setFringesPercent(metaData.fringesPercent || '');
    setHandlingPercent(metaData.handlingPercent || '');
    setMarkupPercent(metaData.markupPercent || '');
    setProductionInsurancePercent(metaData.productionInsurancePercent || '');
    setProductionFeePercent(metaData.productionFeePercent || '');
    setPostMarkupPercent(metaData.postMarkupPercent || '');
    setPostInsurancePercent(metaData.postInsurancePercent || '');
    setPostTaxPercent(metaData.postTaxPercent || '');
    setDeliverables(metaData.deliverables || []);
    setScheduleEntries(metaData.scheduleEntries || []);
  }, [metaData]);

  useEffect(() => {
    if (metaData && metaData.projectName !== bidVersionName && metaData === lastMetaRef.current) {
      setBidVersionName(metaData.projectName || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaData?.projectName]);

  const saveToServer = useCallback(
    (fields: Record<string, unknown>) => {
      if (!metaData) {
        return;
      }
      updateOffer({ id: metaData.id, ...fields } as Partial<Offer> & Pick<Offer, 'id'>)
        .unwrap()
        .then((x) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { details: _details, ...meta } = x;
          dispatch(setMetaData(meta));
          lastMetaRef.current = meta;
          if (x.deliverables) {
            setDeliverables((currentLocal) => {
              if (currentLocal.length === x.deliverables!.length) {
                return currentLocal.map((local, i) => ({ ...local, id: x.deliverables![i].id }));
              }
              return x.deliverables!;
            });
          }
          if (x.scheduleEntries) {
            setScheduleEntries((currentLocal) => {
              if (currentLocal.length === x.scheduleEntries!.length) {
                return currentLocal.map((local, i) => ({ ...local, id: x.scheduleEntries![i].id }));
              }
              return x.scheduleEntries!;
            });
          }
        })
        .catch((x) => {
          logger.error('Failed to save offer metadata', x);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [metaData?.id, updateOffer, dispatch]
  );

  const debouncedSave = useMemo(() => {
    return debounce(saveToServer, 500);
  }, [saveToServer]);

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const handleFieldChange = useCallback(
    (field: string, value: unknown) => {
      debouncedSave({ [field]: value });
    },
    [debouncedSave]
  );

  const handleBidDateChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setBidDate(value);
      handleFieldChange('bidDate', value || null);
    },
    [handleFieldChange]
  );

  const handleRevisionChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setRevision(value);
      handleFieldChange('revision', value);
    },
    [handleFieldChange]
  );

  const handleBidVersionNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setBidVersionName(value);
      handleFieldChange('projectName', value);
    },
    [handleFieldChange]
  );

  const handleTermChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setTerm(value);
      handleFieldChange('term', value);
    },
    [handleFieldChange]
  );

  const handleTerritoryChange = useCallback(
    (value: string[]) => {
      setTerritory(value);
      handleFieldChange('territory', value);
    },
    [handleFieldChange]
  );

  const handleMediaPlacementsChange = useCallback(
    (value: string[]) => {
      setMediaPlacements(value);
      handleFieldChange('mediaPlacements', value);
    },
    [handleFieldChange]
  );

  const handleCoverPageNotesChange = useCallback(
    (value: string) => {
      setCoverPageNotes(value);
      handleFieldChange('coverPageNotes', value);
    },
    [handleFieldChange]
  );

  const handleAssumptionsExclusionsChange = useCallback(
    (value: string) => {
      setAssumptionsExclusions(value);
      handleFieldChange('assumptionsExclusions', value);
    },
    [handleFieldChange]
  );

  const handlePercentChange = useCallback(
    (field: string, setter: (value: string) => void) => {
      return (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setter(value);
        handleFieldChange(field, value || '0');
      };
    },
    [handleFieldChange]
  );

  const handleFringesPercentChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFringesPercent(value);
      handleFieldChange('fringesPercent', value || '0');
      if (metaData) {
        dispatch(setMetaData({ ...metaData, fringesPercent: value || '0' }));
      }
      dispatch(recalculateAllOffers());
    },
    [handleFieldChange, dispatch, metaData]
  );

  const handleMarkupPercentChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setMarkupPercent(value);
      handleFieldChange('markupPercent', value || '0');
      const newPercent = parseFloat(value) || 0;
      const markups = offerDetails?.categoryExternalMarkup || {};
      for (const categoryId of Object.keys(markups)) {
        if (!markups[categoryId].enabled) {
          dispatch(setCategoryExternalMarkup({ categoryId, percent: newPercent }));
        }
      }
    },
    [handleFieldChange, offerDetails, dispatch]
  );

  const handleAddDeliverable = useCallback(() => {
    const newDeliverable: OfferDeliverable = {
      id: uuidv4(),
      quantity: 1,
      duration: '',
      durationUnit: '',
      notes: '',
      sortOrder: deliverables.length,
    };
    const updated = [...deliverables, newDeliverable];
    setDeliverables(updated);
    handleFieldChange('deliverables', updated);
  }, [deliverables, handleFieldChange]);

  const handleRemoveDeliverable = useCallback(
    (index: number) => {
      const updated = deliverables.filter((_, i) => i !== index).map((x, i) => ({ ...x, sortOrder: i }));
      setDeliverables(updated);
      handleFieldChange('deliverables', updated);
    },
    [deliverables, handleFieldChange]
  );

  const handleDeliverableChange = useCallback(
    (index: number, field: keyof OfferDeliverable, value: unknown) => {
      const updated = deliverables.map((x, i) => {
        if (i === index) {
          return { ...x, [field]: value };
        }
        return x;
      });
      setDeliverables(updated);
      handleFieldChange('deliverables', updated);
    },
    [deliverables, handleFieldChange]
  );

  const handleAddScheduleEntry = useCallback(() => {
    const newEntry: OfferScheduleEntry = {
      id: uuidv4(),
      phaseType: '',
      days: 1,
      hoursPerDay: 12,
      notes: '',
      sortOrder: scheduleEntries.length,
    };
    const updated = [...scheduleEntries, newEntry];
    setScheduleEntries(updated);
    handleFieldChange('scheduleEntries', updated);
  }, [scheduleEntries, handleFieldChange]);

  const handleRemoveScheduleEntry = useCallback(
    (index: number) => {
      const updated = scheduleEntries.filter((_, i) => i !== index).map((x, i) => ({ ...x, sortOrder: i }));
      setScheduleEntries(updated);
      handleFieldChange('scheduleEntries', updated);
    },
    [scheduleEntries, handleFieldChange]
  );

  const handleScheduleEntryChange = useCallback(
    (index: number, field: keyof OfferScheduleEntry, value: unknown) => {
      const updated = scheduleEntries.map((x, i) => {
        if (i === index) {
          return { ...x, [field]: value };
        }
        return x;
      });
      setScheduleEntries(updated);
      handleFieldChange('scheduleEntries', updated);
    },
    [scheduleEntries, handleFieldChange]
  );

  if (!metaData || isExternal) {
    return null;
  }

  return (
    <MetaFormContainer>
      <MetaFormHeader $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <MetaFormHeaderLeft>
          <ChevronIcon $isOpen={isOpen}>
            <ArrowIcon />
          </ChevronIcon>
          <MetaFormHeaderTitle>{bidVersionName.toUpperCase() || t('BID_VERSION_NAME')}</MetaFormHeaderTitle>
        </MetaFormHeaderLeft>
      </MetaFormHeader>

      {isOpen && (
        <MetaFormBody>
          <FormRow>
            <FormField $width='150px'>
              <FieldLabel>{t('BID_DATE')}</FieldLabel>
              <FieldInput type='date' value={bidDate} onChange={handleBidDateChange} />
            </FormField>
            <FormField $width='100px'>
              <FieldLabel>{t('REVISION')}</FieldLabel>
              <FieldInput value={revision} onChange={handleRevisionChange} placeholder='1' />
            </FormField>
            <FormField $flex>
              <FieldLabel>{t('BID_VERSION_NAME')}</FieldLabel>
              <FieldInput
                value={bidVersionName}
                onChange={handleBidVersionNameChange}
                placeholder={t('BID_VERSION_NAME')}
              />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField $width='150px'>
              <FieldLabel>{t('TERM_LABEL')}</FieldLabel>
              <FieldInput value={term} onChange={handleTermChange} placeholder='e.g. 1 year' />
            </FormField>
            <FormField $width='300px'>
              <FieldLabel>{t('TERRITORY_LABEL')}</FieldLabel>
              <TagsField
                value={territory}
                onChange={handleTerritoryChange}
                options={TERRITORY_OPTIONS}
                placeholder='e.g. USA, Canada'
              />
            </FormField>
            <FormField $flex>
              <FieldLabel>{t('MEDIA_PLACEMENTS_LABEL')}</FieldLabel>
              <TagsField
                value={mediaPlacements}
                onChange={handleMediaPlacementsChange}
                options={MEDIA_PLACEMENTS_OPTIONS}
                placeholder='e.g. Paid Social, YouTube'
              />
            </FormField>
          </FormRow>

          <div>
            <SectionHeader>
              <SectionLabel>{t('DELIVERABLES')}</SectionLabel>
              <AddButton onClick={handleAddDeliverable}>
                <AddIcon color='var(--gray-light)' width={12} height={12} />
                {t('ADD_DELIVERABLE')}
              </AddButton>
            </SectionHeader>
            {deliverables.map((x, i) => (
              <DynamicRow key={x.id || i} style={{ marginTop: 6 }}>
                <SmallInput
                  $width='50px'
                  type='number'
                  min='1'
                  value={x.quantity}
                  onChange={(event) => handleDeliverableChange(i, 'quantity', parseInt(event.target.value, 10) || 0)}
                />
                <InlineLabel>x</InlineLabel>
                <SmallInput
                  $width='75px'
                  value={x.duration}
                  onChange={(event) => handleDeliverableChange(i, 'duration', event.target.value)}
                  placeholder='30'
                />
                <FieldSelect
                  value={x.durationUnit}
                  onChange={(event) => handleDeliverableChange(i, 'durationUnit', event.target.value)}
                  style={{ width: 100, flex: 'none' }}
                >
                  {DURATION_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </FieldSelect>
                <DeliverableNotesInput
                  value={x.notes}
                  onChange={(event) => handleDeliverableChange(i, 'notes', event.target.value)}
                  placeholder='e.g. 16:9 Master'
                />
                <RemoveButton onClick={() => handleRemoveDeliverable(i)}>
                  <CloseIcon width={10} height={10} />
                </RemoveButton>
              </DynamicRow>
            ))}
          </div>

          <div>
            <SectionHeader>
              <SectionLabel>{t('PRODUCTION_SCHEDULE')}</SectionLabel>
              <AddButton onClick={handleAddScheduleEntry}>
                <AddIcon color='var(--gray-light)' width={12} height={12} />
                {t('ADD_SCHEDULE_ENTRY')}
              </AddButton>
            </SectionHeader>
            <HintText>{t('PRODUCTION_SCHEDULE_HINT')}</HintText>
            {scheduleEntries.map((x, i) => (
              <DynamicRow key={x.id || i} style={{ marginTop: 6 }}>
                <FieldSelect
                  value={x.phaseType}
                  onChange={(event) => handleScheduleEntryChange(i, 'phaseType', event.target.value)}
                  style={{ width: 150, flex: 'none' }}
                >
                  <option value=''>Phase</option>
                  {SCHEDULE_PHASES.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
                </FieldSelect>
                <SmallInput
                  $width='50px'
                  type='number'
                  min='0'
                  value={x.days}
                  onChange={(event) => handleScheduleEntryChange(i, 'days', parseInt(event.target.value, 10) || 0)}
                />
                <InlineLabel>{t('DAYS_LABEL')}</InlineLabel>
                <InlineLabel>{t('AT_LABEL')}</InlineLabel>
                <SmallInput
                  $width='50px'
                  type='number'
                  min='0'
                  value={x.hoursPerDay}
                  onChange={(event) =>
                    handleScheduleEntryChange(i, 'hoursPerDay', parseInt(event.target.value, 10) || 0)
                  }
                />
                <InlineLabel>{t('HOURS_LABEL')}</InlineLabel>
                <ScheduleNotesInput
                  value={x.notes}
                  onChange={(event) => handleScheduleEntryChange(i, 'notes', event.target.value)}
                  placeholder='e.g. 11+1 day'
                />
                <RemoveButton onClick={() => handleRemoveScheduleEntry(i)}>
                  <CloseIcon width={10} height={10} />
                </RemoveButton>
              </DynamicRow>
            ))}
          </div>

          <div>
            <FieldLabel>{t('COVER_PAGE_NOTES')}</FieldLabel>
            <div style={{ marginTop: 4 }}>
              <RichTextEditor value={coverPageNotes} onChange={handleCoverPageNotesChange} />
            </div>
          </div>

          <div>
            <FieldLabel>Assumptions & Exclusions</FieldLabel>
            <div style={{ marginTop: 4 }}>
              <RichTextEditor value={assumptionsExclusions} onChange={handleAssumptionsExclusionsChange} />
            </div>
          </div>

          <div>
            <SectionHeader>
              <SectionLabel>Production Percentages</SectionLabel>
            </SectionHeader>
            <FormRow style={{ flexWrap: 'wrap' }}>
              <FormField $flex style={{ minWidth: 120 }}>
                <FieldLabel>Fringes %</FieldLabel>
                <FieldInput
                  type='number'
                  step='0.01'
                  min='0'
                  value={fringesPercent}
                  onChange={handleFringesPercentChange}
                  placeholder='0'
                />
              </FormField>
              <FormField $flex style={{ minWidth: 120 }}>
                <FieldLabel>Handling %</FieldLabel>
                <FieldInput
                  type='number'
                  step='0.01'
                  min='0'
                  value={handlingPercent}
                  onChange={handlePercentChange('handlingPercent', setHandlingPercent)}
                  placeholder='0'
                />
              </FormField>
              <FormField $flex style={{ minWidth: 180 }}>
                <FieldLabel>Default External Markup %</FieldLabel>
                <FieldInput
                  type='number'
                  step='0.01'
                  min='0'
                  value={markupPercent}
                  onChange={handleMarkupPercentChange}
                  placeholder='0'
                />
              </FormField>
              <FormField $flex style={{ minWidth: 120 }}>
                <FieldLabel>Prod Insurance %</FieldLabel>
                <FieldInput
                  type='number'
                  step='0.01'
                  min='0'
                  value={productionInsurancePercent}
                  onChange={handlePercentChange('productionInsurancePercent', setProductionInsurancePercent)}
                  placeholder='0'
                />
              </FormField>
              <FormField $flex style={{ minWidth: 120 }}>
                <FieldLabel>Prod Fee %</FieldLabel>
                <FieldInput
                  type='number'
                  step='0.01'
                  min='0'
                  value={productionFeePercent}
                  onChange={handlePercentChange('productionFeePercent', setProductionFeePercent)}
                  placeholder='0'
                />
              </FormField>
            </FormRow>
          </div>

          <div>
            <SectionHeader>
              <SectionLabel>Post-Production Percentages</SectionLabel>
            </SectionHeader>
            <FormRow style={{ flexWrap: 'wrap' }}>
              <FormField $flex style={{ minWidth: 120 }}>
                <FieldLabel>Post Markup %</FieldLabel>
                <FieldInput
                  type='number'
                  step='0.01'
                  min='0'
                  value={postMarkupPercent}
                  onChange={handlePercentChange('postMarkupPercent', setPostMarkupPercent)}
                  placeholder='0'
                />
              </FormField>
              <FormField $flex style={{ minWidth: 120 }}>
                <FieldLabel>Post Insurance %</FieldLabel>
                <FieldInput
                  type='number'
                  step='0.01'
                  min='0'
                  value={postInsurancePercent}
                  onChange={handlePercentChange('postInsurancePercent', setPostInsurancePercent)}
                  placeholder='0'
                />
              </FormField>
              <FormField $flex style={{ minWidth: 120 }}>
                <FieldLabel>Post Tax %</FieldLabel>
                <FieldInput
                  type='number'
                  step='0.01'
                  min='0'
                  value={postTaxPercent}
                  onChange={handlePercentChange('postTaxPercent', setPostTaxPercent)}
                  placeholder='0'
                />
              </FormField>
            </FormRow>
          </div>
        </MetaFormBody>
      )}
    </MetaFormContainer>
  );
};
