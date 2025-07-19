package main

import "testing"

func TestExample(t *testing.T) {
	tests := []struct {
		name  string
		input int
		want  int
	}{
		{name: "positive", input: 5, want: 5},
		{name: "negative", input: -3, want: 3},
		{"zero", 0, 0},
		{
			name:  "complex_case",
			input: 10,
			want:  10,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// test implementation
		})
	}
}
