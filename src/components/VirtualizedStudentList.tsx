import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Student } from '../types';

interface StudentStatusInfo {
  isCurrentlyHaid: boolean;
  suciInfo: {
    days: number;
    isUnder15Days: boolean;
    hasPreviousRecord: boolean;
  };
}

interface VirtualizedStudentListProps {
  students: Student[];
  studentStatusMap: Map<string, StudentStatusInfo>;
  selectedStudentId?: string | null;
  onSelectStudent: (student: Student) => void;
  containerHeight?: number;
  itemHeight?: number;
}

export const VirtualizedStudentList: React.FC<VirtualizedStudentListProps> = ({
  students,
  studentStatusMap,
  selectedStudentId,
  onSelectStudent,
  containerHeight = 260,
  itemHeight = 52,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Handle scroll event with requestAnimationFrame for smooth 60-120fps performance
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Reset scroll when dataset changes significantly
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [students.length]);

  const totalCount = students.length;
  const totalHeight = totalCount * itemHeight;

  // Calculate visible window range with overscan buffer (4 items before & after)
  const overscan = 4;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalCount - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex && i < totalCount; i++) {
    visibleItems.push({
      index: i,
      student: students[i],
      top: i * itemHeight,
    });
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: `${containerHeight}px` }}
      className="relative overflow-y-auto w-full rounded-xl border border-pink-100/90 bg-pink-50/20 pr-1 select-none will-change-scroll"
    >
      {/* Spacer to give full scroll height */}
      <div style={{ height: `${totalHeight}px`, width: '100%', position: 'relative' }}>
        {visibleItems.map(({ index, student, top }) => {
          const status = studentStatusMap.get(student.id);
          const isSelected = selectedStudentId === student.id;
          const isCurrentlyHaid = status?.isCurrentlyHaid || false;
          const suciInfo = status?.suciInfo;

          return (
            <div
              key={student.id || index}
              style={{
                position: 'absolute',
                top: `${top}px`,
                left: 0,
                right: 0,
                height: `${itemHeight - 4}px`, // 4px margin
              }}
              onClick={() => onSelectStudent(student)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-2 mx-1 shadow-2xs touch-manipulation ${
                isSelected
                  ? 'bg-pink-100/90 border-pink-400 ring-2 ring-pink-300'
                  : 'bg-white hover:bg-pink-50 border-pink-100'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {student.foto ? (
                  <img
                    src={student.foto}
                    alt={student.nama}
                    loading="lazy"
                    className="w-7 h-7 rounded-full object-cover border border-pink-200 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {student.nama.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                    {student.nama}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {student.kelas} • NIK: {student.nik || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {isCurrentlyHaid ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    Sedang Haid
                  </span>
                ) : suciInfo?.hasPreviousRecord && suciInfo?.isUnder15Days ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Suci H-{suciInfo.days}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Suci
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
