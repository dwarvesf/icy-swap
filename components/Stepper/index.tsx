import React from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { Spinner } from "../Spinner";
import cln from "classnames";

type StepProps = {
  num: number;
  title: React.ReactNode;
  children: React.ReactNode;
  _middle?: boolean;
  _current?: number;
  _loading?: boolean;
  _last?: boolean;
};

const Step = (props: StepProps) => {
  const current = props._current ?? 0;
  const loading = props._loading ?? false;
  const last = props._last ?? false;
  const middle = props._middle ?? false;

  return (
    <div
      className={cln("flex gap-x-3", {
        "pt-5": props.num === 1 && middle,
      })}
    >
      <div className="relative">
        {middle && props.num === 1 && (
          <div
            className={cln(
              "bg-brand absolute -top-full left-1/2 rounded -translate-x-1/2 h-full w-0.5"
            )}
          />
        )}
        {(!last || middle) && (
          <div
            className={cln(
              "absolute top-0 left-1/2 rounded -translate-x-1/2 h-full w-0.5",
              {
                "mt-0.5": !last,
                "bg-brand":
                  props.num < current || (middle && props.num === current),
                "bg-gray-500":
                  (middle && props.num > current) ||
                  (!middle && props.num >= current),
              }
            )}
          />
        )}
        <div
          className={cln(
            "relative mt-0.5 text-white w-5 h-5 rounded-full flex justify-center items-center text-xs self-start",
            {
              "bg-brand": props.num <= current,
              "bg-gray-500": props.num > current,
            }
          )}
        >
          {loading && props.num === current ? (
            <Spinner className="w-3 h-3" />
          ) : props.num < current ? (
            <CheckIcon className="w-3 h-3" />
          ) : (
            props.num
          )}
        </div>
      </div>
      <div
        className={cln("flex flex-col pb-5", {
          "text-gray-400": props.num > current,
          "text-white": props.num <= current,
        })}
      >
        <p className="font-medium text-sm">{props.title}</p>
        <p className="text-xs">{props.children}</p>
      </div>
    </div>
  );
};

type StepperContainerProps = {
  current: number;
  loading: boolean;
  children: React.ReactNode;
  middle?: boolean;
};

const StepperContainer = (props: StepperContainerProps) => {
  return (
    <div className="flex flex-col w-full">
      {React.Children.map(props.children, (child, i) => {
        return React.cloneElement(child as any, {
          _middle: props.middle,
          _current: props.current,
          _loading: props.loading,
          _last: i + 1 === React.Children.count(props.children),
        });
      })}
    </div>
  );
};

export const Stepper = {
  Container: StepperContainer,
  Step,
};
