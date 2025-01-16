{{/* Define the name of the chart */}}
{{- define "my-chart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Create a default fully qualified app name */}}
{{- define "my-chart.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/* Generate basic labels */}}
{{- define "my-chart.labels" -}}
app.kubernetes.io/name: {{ include "my-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/* Selector labels */}}
{{- define "my-chart.selectorLabels" -}}
app.kubernetes.io/name: {{ include "my-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/* Generate Helm-specific annotations */}}
{{- define "my-chart.helmAnnotations" -}}
cert-manager.io/cluster-issuer: {{ .Values.ingress.clusterIssuer }}
kubernetes.io/ingress.class: {{ .Values.ingress.className }}
meta.helm.sh/release-name: {{ .Release.Name }}
meta.helm.sh/release-namespace: {{ .Release.Namespace }}
{{- end -}}

{{/* Generate dynamic annotations for Ingress */}}
{{- define "my-chart.dynamicIngressAnnotations" -}}
{{- if .Values.ingress.annotations.authEnabled }}
nginx.ingress.kubernetes.io/auth-type: basic
nginx.ingress.kubernetes.io/auth-secret: {{ .Values.ingress.annotations.authSecret }}
nginx.ingress.kubernetes.io/auth-realm: {{ .Values.ingress.annotations.authRealm | quote }}
{{- end -}}
{{- end -}}
