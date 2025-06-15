package org.example.topcitonthehoseo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetRankListResponseDto {

    private String nickname;

    private String rankImage;

    private int totalScore;

    private int lecture1Score;

    private int lecture2Score;

    private int lecture3Score;

    private int lecture4Score;

    private int lecture5Score;

    private int lecture6Score;
}
