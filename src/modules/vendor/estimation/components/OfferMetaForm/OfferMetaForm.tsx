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

import styles from './OfferMetaForm.module.css';

interface TagsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  placeholder?: string;
}

const TagsField = (props: TagsFieldProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableOptions = useMemo(() => {
    return props.options.filter((x) => !props.value.includes(x));
  }, [props.options, props.value]);

  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) {
      return availableOptions;
    }
    return availableOptions.filter((x) => x.toLowerCase().includes(inputValue.toLowerCase()));
  }, [availableOptions, inputValue]);

  const handleAddTag = useCallback(
    (tag: string) => {
      if (!props.value.includes(tag)) {
        props.onChange([...props.value, tag]);
      }
      setInputValue('');
      setShowSuggestions(false);
    },
    [props]
  );

  const handleRemoveTag = useCallback(
    (tag: string) => {
      props.onChange(props.value.filter((x) => x !== tag));
    },
    [props]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && inputValue.trim()) {
        event.preventDefault();
        handleAddTag(inputValue.trim());
      } else if (event.key === 'Backspace' && !inputValue && props.value.length > 0) {
        handleRemoveTag(props.value[props.value.length - 1]);
      }
    },
    [inputValue, props.value, handleAddTag, handleRemoveTag]
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
      <div className={styles.tagsContainer} onClick={() => inputRef.current?.focus()}>
        {props.value.map((x) => (
          <span key={x} className={styles.tag}>
            {x}
            <button
              className={styles.tagRemove}
              onClick={(event) => {
                event.stopPropagation();
                handleRemoveTag(x);
              }}
            >
              <CloseIcon />
            </button>
          </span>
        ))}
        <input
          className={styles.tagInput}
          ref={inputRef}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={props.value.length === 0 ? props.placeholder || 'Type to search or add custom value' : ''}
        />
      </div>
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

export const OfferMetaForm = () => {
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
    <div className={styles.metaFormContainer}>
      <div
        className={isOpen ? `${styles.metaFormHeader} ${styles.metaFormHeaderOpen}` : styles.metaFormHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.metaFormHeaderLeft}>
          <div className={isOpen ? `${styles.chevronIcon} ${styles.chevronIconOpen}` : styles.chevronIcon}>
            <ArrowIcon />
          </div>
          <span className={styles.metaFormHeaderTitle}>{bidVersionName.toUpperCase() || t('BID_VERSION_NAME')}</span>
        </div>
      </div>

      {isOpen && (
        <div className={styles.metaFormBody}>
          <div className={styles.formRow}>
            <div className={styles.formField} style={{ width: '150px' }}>
              <label className={styles.fieldLabel}>{t('BID_DATE')}</label>
              <input className={styles.fieldInput} type='date' value={bidDate} onChange={handleBidDateChange} />
            </div>
            <div className={styles.formField} style={{ width: '100px' }}>
              <label className={styles.fieldLabel}>{t('REVISION')}</label>
              <input className={styles.fieldInput} value={revision} onChange={handleRevisionChange} placeholder='1' />
            </div>
            <div className={`${styles.formField} ${styles.formFieldFlex}`}>
              <label className={styles.fieldLabel}>{t('BID_VERSION_NAME')}</label>
              <input
                className={styles.fieldInput}
                value={bidVersionName}
                onChange={handleBidVersionNameChange}
                placeholder={t('BID_VERSION_NAME')}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField} style={{ width: '150px' }}>
              <label className={styles.fieldLabel}>{t('TERM_LABEL')}</label>
              <input className={styles.fieldInput} value={term} onChange={handleTermChange} placeholder='e.g. 1 year' />
            </div>
            <div className={styles.formField} style={{ width: '300px' }}>
              <label className={styles.fieldLabel}>{t('TERRITORY_LABEL')}</label>
              <TagsField
                value={territory}
                onChange={handleTerritoryChange}
                options={TERRITORY_OPTIONS}
                placeholder='e.g. USA, Canada'
              />
            </div>
            <div className={`${styles.formField} ${styles.formFieldFlex}`}>
              <label className={styles.fieldLabel}>{t('MEDIA_PLACEMENTS_LABEL')}</label>
              <TagsField
                value={mediaPlacements}
                onChange={handleMediaPlacementsChange}
                options={MEDIA_PLACEMENTS_OPTIONS}
                placeholder='e.g. Paid Social, YouTube'
              />
            </div>
          </div>

          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>{t('DELIVERABLES')}</span>
              <button className={styles.addButton} onClick={handleAddDeliverable}>
                <AddIcon color='var(--gray-light)' width={12} height={12} />
                {t('ADD_DELIVERABLE')}
              </button>
            </div>
            {deliverables.map((x, i) => (
              <div key={x.id || i} className={styles.dynamicRow} style={{ marginTop: 6 }}>
                <input
                  className={`${styles.fieldInput} ${styles.smallInput}`}
                  style={{ '--small-input-width': '50px' } as React.CSSProperties}
                  type='number'
                  min='1'
                  value={x.quantity}
                  onChange={(event) => handleDeliverableChange(i, 'quantity', parseInt(event.target.value, 10) || 0)}
                />
                <span className={styles.inlineLabel}>x</span>
                <input
                  className={`${styles.fieldInput} ${styles.smallInput}`}
                  style={{ '--small-input-width': '75px' } as React.CSSProperties}
                  value={x.duration}
                  onChange={(event) => handleDeliverableChange(i, 'duration', event.target.value)}
                  placeholder='30'
                />
                <select
                  className={styles.fieldSelect}
                  value={x.durationUnit}
                  onChange={(event) => handleDeliverableChange(i, 'durationUnit', event.target.value)}
                  style={{ width: 100, flex: 'none' }}
                >
                  {DURATION_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <input
                  className={styles.fieldInput}
                  style={{ flex: 1 }}
                  value={x.notes}
                  onChange={(event) => handleDeliverableChange(i, 'notes', event.target.value)}
                  placeholder='e.g. 16:9 Master'
                />
                <button className={styles.removeButton} onClick={() => handleRemoveDeliverable(i)}>
                  <CloseIcon width={10} height={10} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>{t('PRODUCTION_SCHEDULE')}</span>
              <button className={styles.addButton} onClick={handleAddScheduleEntry}>
                <AddIcon color='var(--gray-light)' width={12} height={12} />
                {t('ADD_SCHEDULE_ENTRY')}
              </button>
            </div>
            <span className={styles.hintText}>{t('PRODUCTION_SCHEDULE_HINT')}</span>
            {scheduleEntries.map((x, i) => (
              <div key={x.id || i} className={styles.dynamicRow} style={{ marginTop: 6 }}>
                <select
                  className={styles.fieldSelect}
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
                </select>
                <input
                  className={`${styles.fieldInput} ${styles.smallInput}`}
                  style={{ '--small-input-width': '50px' } as React.CSSProperties}
                  type='number'
                  min='0'
                  value={x.days}
                  onChange={(event) => handleScheduleEntryChange(i, 'days', parseInt(event.target.value, 10) || 0)}
                />
                <span className={styles.inlineLabel}>{t('DAYS_LABEL')}</span>
                <span className={styles.inlineLabel}>{t('AT_LABEL')}</span>
                <input
                  className={`${styles.fieldInput} ${styles.smallInput}`}
                  style={{ '--small-input-width': '50px' } as React.CSSProperties}
                  type='number'
                  min='0'
                  value={x.hoursPerDay}
                  onChange={(event) =>
                    handleScheduleEntryChange(i, 'hoursPerDay', parseInt(event.target.value, 10) || 0)
                  }
                />
                <span className={styles.inlineLabel}>{t('HOURS_LABEL')}</span>
                <input
                  className={styles.fieldInput}
                  style={{ flex: 1 }}
                  value={x.notes}
                  onChange={(event) => handleScheduleEntryChange(i, 'notes', event.target.value)}
                  placeholder='e.g. 11+1 day'
                />
                <button className={styles.removeButton} onClick={() => handleRemoveScheduleEntry(i)}>
                  <CloseIcon width={10} height={10} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className={styles.fieldLabel}>{t('COVER_PAGE_NOTES')}</label>
            <div style={{ marginTop: 4 }}>
              <RichTextEditor value={coverPageNotes} onChange={handleCoverPageNotesChange} />
            </div>
          </div>

          <div>
            <label className={styles.fieldLabel}>Assumptions &amp; Exclusions</label>
            <div style={{ marginTop: 4 }}>
              <RichTextEditor value={assumptionsExclusions} onChange={handleAssumptionsExclusionsChange} />
            </div>
          </div>

          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Production Percentages</span>
            </div>
            <div className={styles.formRow} style={{ flexWrap: 'wrap' }}>
              <div className={`${styles.formField} ${styles.formFieldFlex}`} style={{ minWidth: 120 }}>
                <label className={styles.fieldLabel}>Fringes %</label>
                <input
                  className={styles.fieldInput}
                  type='number'
                  step='0.01'
                  min='0'
                  value={fringesPercent}
                  onChange={handleFringesPercentChange}
                  placeholder='0'
                />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFlex}`} style={{ minWidth: 120 }}>
                <label className={styles.fieldLabel}>Handling %</label>
                <input
                  className={styles.fieldInput}
                  type='number'
                  step='0.01'
                  min='0'
                  value={handlingPercent}
                  onChange={handlePercentChange('handlingPercent', setHandlingPercent)}
                  placeholder='0'
                />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFlex}`} style={{ minWidth: 180 }}>
                <label className={styles.fieldLabel}>Default External Markup %</label>
                <input
                  className={styles.fieldInput}
                  type='number'
                  step='0.01'
                  min='0'
                  value={markupPercent}
                  onChange={handleMarkupPercentChange}
                  placeholder='0'
                />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFlex}`} style={{ minWidth: 120 }}>
                <label className={styles.fieldLabel}>Prod Insurance %</label>
                <input
                  className={styles.fieldInput}
                  type='number'
                  step='0.01'
                  min='0'
                  value={productionInsurancePercent}
                  onChange={handlePercentChange('productionInsurancePercent', setProductionInsurancePercent)}
                  placeholder='0'
                />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFlex}`} style={{ minWidth: 120 }}>
                <label className={styles.fieldLabel}>Prod Fee %</label>
                <input
                  className={styles.fieldInput}
                  type='number'
                  step='0.01'
                  min='0'
                  value={productionFeePercent}
                  onChange={handlePercentChange('productionFeePercent', setProductionFeePercent)}
                  placeholder='0'
                />
              </div>
            </div>
          </div>

          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Post-Production Percentages</span>
            </div>
            <div className={styles.formRow} style={{ flexWrap: 'wrap' }}>
              <div className={`${styles.formField} ${styles.formFieldFlex}`} style={{ minWidth: 120 }}>
                <label className={styles.fieldLabel}>Post Markup %</label>
                <input
                  className={styles.fieldInput}
                  type='number'
                  step='0.01'
                  min='0'
                  value={postMarkupPercent}
                  onChange={handlePercentChange('postMarkupPercent', setPostMarkupPercent)}
                  placeholder='0'
                />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFlex}`} style={{ minWidth: 120 }}>
                <label className={styles.fieldLabel}>Post Insurance %</label>
                <input
                  className={styles.fieldInput}
                  type='number'
                  step='0.01'
                  min='0'
                  value={postInsurancePercent}
                  onChange={handlePercentChange('postInsurancePercent', setPostInsurancePercent)}
                  placeholder='0'
                />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFlex}`} style={{ minWidth: 120 }}>
                <label className={styles.fieldLabel}>Post Tax %</label>
                <input
                  className={styles.fieldInput}
                  type='number'
                  step='0.01'
                  min='0'
                  value={postTaxPercent}
                  onChange={handlePercentChange('postTaxPercent', setPostTaxPercent)}
                  placeholder='0'
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
