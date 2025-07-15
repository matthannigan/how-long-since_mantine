'use client';

import React, { useEffect } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import {
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { getTimeCommitmentOptions } from '@/lib/constants/timeCommitments';
import { TaskFormDataSchema } from '@/lib/validation/schemas';
import type { Category, FrequencyUnit, TaskFormData } from '@/types';

interface TaskFormProps {
  /** Initial task data for editing (undefined for creating new task) */
  initialData?: Partial<TaskFormData>;
  /** Available categories for selection */
  categories: Category[];
  /** Form submission handler */
  onSubmit: (data: TaskFormData) => void | Promise<void>;
  /** Cancel handler */
  onCancel: () => void;
  /** Form mode */
  mode: 'create' | 'edit';
  /** Loading state during submission */
  loading?: boolean;
}

const FREQUENCY_UNITS: { value: FrequencyUnit; label: string }[] = [
  { value: 'day', label: 'Day(s)' },
  { value: 'week', label: 'Week(s)' },
  { value: 'month', label: 'Month(s)' },
  { value: 'year', label: 'Year(s)' },
];

export function TaskForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  mode,
  loading = false,
}: TaskFormProps) {
  const form = useForm<TaskFormData>({
    mode: 'uncontrolled',
    validate: (values) => {
      const result = TaskFormDataSchema.safeParse(values);
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        return errors;
      }
      return {};
    },
    initialValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      categoryId: initialData?.categoryId || '',
      expectedFrequency: initialData?.expectedFrequency,
      timeCommitment: initialData?.timeCommitment,
      notes: initialData?.notes || '',
    },
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      form.setValues({
        name: initialData.name || '',
        description: initialData.description || '',
        categoryId: initialData.categoryId || '',
        expectedFrequency: initialData.expectedFrequency || undefined,
        timeCommitment: initialData.timeCommitment || undefined,
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (values: TaskFormData) => {
    try {
      await onSubmit(values);
    } catch (error) {
      // Error handling is managed by parent component
      // Error handling is managed by parent component
      // eslint-disable-next-line no-console
      console.error('Form submission error:', error);
    }
  };

  const timeCommitmentOptions = getTimeCommitmentOptions().map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const hasFrequency = form.getValues().expectedFrequency !== undefined;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap="lg">
        <Title order={2} size="h3">
          {mode === 'create' ? 'Create New Task' : 'Edit Task'}
        </Title>

        {/* Task Name - Required */}
        <TextInput
          label="Task Name"
          placeholder="Enter task name"
          required
          key={form.key('name')}
          {...form.getInputProps('name')}
          aria-describedby={form.errors.name ? 'name-error' : undefined}
          data-testid="task-name-input"
        />

        {/* Category Selection - Required */}
        <Select
          label="Category"
          placeholder="Select a category"
          required
          data={categoryOptions}
          key={form.key('categoryId')}
          {...form.getInputProps('categoryId')}
          aria-describedby={form.errors.categoryId ? 'category-error' : undefined}
          data-testid="task-category-select"
          searchable
          clearable={false}
        />

        {/* Description - Optional */}
        <Textarea
          label="Description"
          placeholder="Brief description of the task (optional)"
          rows={3}
          key={form.key('description')}
          {...form.getInputProps('description')}
          aria-describedby={form.errors.description ? 'description-error' : undefined}
          data-testid="task-description-input"
        />

        {/* Expected Frequency - Optional */}
        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Expected Frequency (Optional)
          </Text>
          <Text size="xs" c="dimmed">
            How often should this task be done? This helps identify overdue tasks.
          </Text>

          <Group gap="sm" align="flex-end">
            <NumberInput
              label="Every"
              placeholder="1"
              min={1}
              max={999}
              value={form.getValues().expectedFrequency?.value || ''}
              onChange={(value) => {
                const numValue = typeof value === 'number' ? value : undefined;
                const currentFreq = form.getValues().expectedFrequency;

                if (numValue && numValue > 0) {
                  form.setFieldValue('expectedFrequency', {
                    value: numValue,
                    unit: currentFreq?.unit || 'week',
                  });
                } else {
                  form.setFieldValue('expectedFrequency', undefined);
                }
              }}
              style={{ flex: 1 }}
              data-testid="frequency-value-input"
              aria-label="Frequency value"
            />

            <Select
              label="Unit"
              data={FREQUENCY_UNITS}
              value={form.getValues().expectedFrequency?.unit || ''}
              onChange={(value) => {
                const currentFreq = form.getValues().expectedFrequency;
                if (value && currentFreq?.value) {
                  form.setFieldValue('expectedFrequency', {
                    value: currentFreq.value,
                    unit: value as FrequencyUnit,
                  });
                }
              }}
              style={{ flex: 1 }}
              data-testid="frequency-unit-select"
              aria-label="Frequency unit"
              disabled={!hasFrequency}
            />
          </Group>
        </Stack>

        {/* Time Commitment - Optional */}
        <Select
          label="Time Commitment (Optional)"
          placeholder="How long does this task usually take?"
          data={timeCommitmentOptions}
          key={form.key('timeCommitment')}
          {...form.getInputProps('timeCommitment')}
          data-testid="task-time-commitment-select"
          clearable
        />

        {/* Notes - Optional */}
        <Textarea
          label="Notes"
          placeholder="Additional notes or reminders (optional)"
          rows={3}
          key={form.key('notes')}
          {...form.getInputProps('notes')}
          aria-describedby={form.errors.notes ? 'notes-error' : undefined}
          data-testid="task-notes-input"
        />

        {/* Form Actions */}
        <Group justify="flex-end" gap="sm">
          <Button
            variant="subtle"
            onClick={onCancel}
            disabled={loading}
            leftSection={<IconX size={16} />}
            data-testid="cancel-button"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={loading}
            leftSection={!loading ? <IconCheck size={16} /> : undefined}
            data-testid="submit-button"
          >
            {mode === 'create' ? 'Create Task' : 'Save Changes'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
