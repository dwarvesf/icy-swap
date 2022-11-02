import { ConnectKitButton } from "connectkit";
import {
  useSwitchNetwork,
  useNetwork,
  useAccount,
  chain as defaultChain,
  useBalance,
} from "wagmi";
import { address as contractAddress } from "../../contract/icy";
import { Spinner } from "../Spinner";
import { Stepper } from "../Stepper";

export const Swap = () => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { address, isConnected } = useAccount();

  const {
    data: balance,
    isLoading: isLoadingBalance,
    error: errorBalance,
  } = useBalance({
    addressOrName: address,
    token: contractAddress,
    watch: true,
  });

  if (chain?.unsupported) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center">
        <ConnectKitButton />
        <p className="mt-3 text-xl font-medium w-96 text-center">
          You need to connect to the{" "}
          <button
            type="button"
            onClick={() => switchNetwork?.(defaultChain.polygon.id)}
            className="text-[#8247e5] underline"
          >
            Polygon
          </button>{" "}
          network to swap $ICY
        </p>
      </div>
    );
  }

  return (
    <div className="mt-16 flex flex-col items-center justify-center">
      <ConnectKitButton />
      {isConnected && (
        <>
          <p className="mt-3 text-xl font-medium">
            {isLoadingBalance ? (
              <Spinner className="w-4 h-4" />
            ) : errorBalance || !balance ? (
              "error"
            ) : (
              `You have: ${balance.formatted} $ICY`
            )}
          </p>
          <button className="mt-4 bg-brand text-white px-5 py-2.5 rounded-sm">
            Swap $ICY for $USDC
          </button>

          <div className="mt-12 flex w-72">
            <Stepper.Container current={3} loading>
              <Stepper.Step num={1} title="Step 1">
                Lorem ipsum dolor sit amet, qui minim labore adipisicing minim
                sint cillum sint consectetur cupidatat.
              </Stepper.Step>
              <Stepper.Step num={2} title="Step 2">
                Lorem ipsum dolor sit amet, qui minim labore adipisicing minim
                sint cillum sint consectetur cupidatat.
              </Stepper.Step>
              <Stepper.Step num={3} title="Step 3">
                Lorem ipsum dolor sit amet, qui minim labore adipisicing minim
                sint cillum sint consectetur cupidatat.
              </Stepper.Step>
              <Stepper.Step num={4} title="Step 4">
                Lorem ipsum dolor sit amet, qui minim labore adipisicing minim
                sint cillum sint consectetur cupidatat.
              </Stepper.Step>
            </Stepper.Container>
          </div>
        </>
      )}
    </div>
  );
};
