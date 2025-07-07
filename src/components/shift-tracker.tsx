"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkShift } from "@/lib/types";

interface ShiftTrackerProps {
  shifts: WorkShift[];
  onShiftsChange: (shifts: WorkShift[]) => void;
  disabled?: boolean;
}

export function ShiftTracker({
  shifts,
  onShiftsChange,
  disabled = false,
}: ShiftTrackerProps) {
  const [newShift, setNewShift] = useState({
    startTime: "",
    endTime: "",
    breakMinutes: 0,
    description: "",
  });

  const generateShiftId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const calculateShiftHours = (shift: WorkShift): number => {
    const [startHour, startMin] = shift.startTime.split(":").map(Number);
    const [endHour, endMin] = shift.endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;

    // Handle overnight shifts
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    const totalMinutes = endMinutes - startMinutes - (shift.breakMinutes || 0);
    return Math.max(0, totalMinutes / 60);
  };

  const getTotalHours = (): number => {
    return shifts.reduce(
      (total, shift) => total + calculateShiftHours(shift),
      0
    );
  };

  const addShift = () => {
    if (!newShift.startTime || !newShift.endTime) return;

    const shift: WorkShift = {
      id: generateShiftId(),
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      breakMinutes: newShift.breakMinutes || 0,
      description: newShift.description || undefined,
    };

    const updatedShifts = [...shifts, shift];
    onShiftsChange(updatedShifts);

    // Reset form
    setNewShift({
      startTime: "",
      endTime: "",
      breakMinutes: 0,
      description: "",
    });
  };

  const removeShift = (shiftId: string) => {
    const updatedShifts = shifts.filter((shift) => shift.id !== shiftId);
    onShiftsChange(updatedShifts);
  };

  const formatTime = (time: string): string => {
    const [hour, minute] = time.split(":");
    const hourNum = Number.parseInt(hour);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour =
      hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const formatHoursToHrsMins = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (minutes === 0) {
      return `${wholeHours}hrs`;
    } else {
      return `${wholeHours}hrs ${minutes}mins`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Work Shifts</h3>
        <div className="text-sm text-gray-600">
          Total:{" "}
          <span className="font-semibold">
            {formatHoursToHrsMins(getTotalHours())}
          </span>
        </div>
      </div>

      {/* Existing Shifts */}
      {shifts.length > 0 && (
        <div className="space-y-3">
          {shifts.map((shift, index) => (
            <Card
              key={`shift-${index}-${shift.startTime}-${shift.endTime}`}
              className="bg-gray-50"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium">
                        Shift {index + 1}: {formatTime(shift.startTime)} -{" "}
                        {formatTime(shift.endTime)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {calculateShiftHours(shift).toFixed(2)} hours
                      </div>
                      {shift.breakMinutes && shift.breakMinutes > 0 && (
                        <div className="text-sm text-gray-500">
                          ({shift.breakMinutes}min break)
                        </div>
                      )}
                    </div>
                    {shift.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {shift.description}
                      </div>
                    )}
                  </div>
                  {!disabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeShift(shift.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Shift */}
      {!disabled && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="text-base">Add Work Shift</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={newShift.startTime}
                  onChange={(e) =>
                    setNewShift({ ...newShift, startTime: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  End Time
                </label>
                <Input
                  type="time"
                  value={newShift.endTime}
                  onChange={(e) =>
                    setNewShift({ ...newShift, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Break (minutes)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="480"
                  value={newShift.breakMinutes}
                  onChange={(e) =>
                    setNewShift({
                      ...newShift,
                      breakMinutes: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={addShift}
                  disabled={!newShift.startTime || !newShift.endTime}
                  className="w-full"
                >
                  Add Shift
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <Input
                type="text"
                value={newShift.description}
                onChange={(e) =>
                  setNewShift({ ...newShift, description: e.target.value })
                }
                placeholder="e.g., Morning shift, Evening shift, etc."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {shifts.length === 0 && disabled && (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>No shifts recorded for this day</p>
        </div>
      )}

      {/* Quick Add Common Shifts */}
      {!disabled && shifts.length === 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-3">Quick add common shifts:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const shift: WorkShift = {
                  id: generateShiftId(),
                  startTime: "09:00",
                  endTime: "17:00",
                  breakMinutes: 60,
                  description: "Full day (9-5)",
                };
                onShiftsChange([shift]);
              }}
            >
              9 AM - 5 PM
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const shift: WorkShift = {
                  id: generateShiftId(),
                  startTime: "08:00",
                  endTime: "16:00",
                  breakMinutes: 60,
                  description: "Morning shift",
                };
                onShiftsChange([shift]);
              }}
            >
              8 AM - 4 PM
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const shifts: WorkShift[] = [
                  {
                    id: generateShiftId(),
                    startTime: "09:00",
                    endTime: "12:00",
                    breakMinutes: 0,
                    description: "Morning shift",
                  },
                  {
                    id: generateShiftId() + "2",
                    startTime: "18:00",
                    endTime: "21:00",
                    breakMinutes: 0,
                    description: "Evening shift",
                  },
                ];
                onShiftsChange(shifts);
              }}
            >
              Split Shift (9-12, 6-9)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
