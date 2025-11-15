import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
export const AboutSection = () => {
    return(
      <section
        className="lg:w-full h-screen flex flex-col md:flex-row items-center justify-start gap-10 mt-3"
      >
        <div className="col ml-10">
          <h2 className="text-3xl font-bold mb-4 text-[50px]">关于 VATPRC</h2>
          <hr className="lg:block relative h-px my-8 bg-white border-0 mt-5 md:hidden sm:hidden" />
          <div className="row">
            <p className="relative mt-5 w-full">
              VATSIM (Virtual Air Traffic Simulation Network)，中文名为模拟航管组织，是一个为非盈利性组织，运营着一个专业的，全球性的网络，为各种装有模拟飞行软件或者虚拟管制软件的电脑提供了一个连线平台，从而给予了一个模拟真实的飞行环境。在VATSIM的网络上，无论是飞行员还是空中交通管制员，除了需要遵守VATSIM的规定外，也需要跟随真实的天气，民航规定，飞行程序，航线等来使用VATSIM的服务，以达到最接近现实世界的飞行环境。
              VATSIM是全球两个主要模拟飞行网络组织之一，允许飞友进行连线飞行或者充当空中交通管制员的角色。飞行员和管制员之间的通讯采用整合的语音和文字系统。用户通过连飞软件或管制软件连入网络。通过VATSIM，普通百姓都能走到一起在网络上充当虚拟飞行员和管制员。
              VATSIM的目标是尽可能的接近真实的航空运行程序和模拟真实的飞行环境，包括真实的标准程序和无线电通信。这样的高真度模拟，使VATSIM能帮助一些缺乏陆空对话经验的飞行学员进行训练，与此同时，一些私人和商业飞行员也在VATSIM帮助他们提高技能，特别是对于陆空对话的提高。
              VATSIM根据地理位置被划分为三个区域，每个区域略有不同的运作程序，以处理不同的地方差异。三个区域被进一步细分为特定分部(Divisions)。然后分部本身可以划分为飞行情报区(FIRs)，虚拟区域控制中心(vACCs)，和航路交通管制中心(ARTCCs)。
            </p>
            <ul className="mt-10">
                三个区域为：
                <li>欧洲、中东与非洲地区 (VATEMEA)</li>
                <li>亚洲与大洋洲地区 (VATAPAC)</li>
                <li>美洲地区 (VATAMAS)</li>
            </ul>
          </div>
        </div>
      </section>
    )
}